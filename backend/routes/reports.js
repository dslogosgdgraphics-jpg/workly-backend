const express = require('express');
const router = express.Router();
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');

router.get('/dashboard', protect, checkSubscription, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let stats = {};
        
        if (req.user.role === 'admin') {
            const totalEmployees = await User.countDocuments({
                company: req.user.company,
                role: 'employee',
                status: 'active'
            });
            
            const todayAttendance = await Attendance.find({
                company: req.user.company,
                date: { $gte: today },
                status: { $in: ['present', 'late'] }
            });
            
            const pendingLeaves = await Leave.countDocuments({
                company: req.user.company,
                status: 'pending'
            });
            
            const employees = await User.find({
                company: req.user.company,
                role: 'employee'
            });
            
            const monthlySalaryCost = employees.reduce((sum, emp) => sum + emp.salary, 0);
            
            stats = {
                totalEmployees,
                presentToday: todayAttendance.length,
                pendingLeaves,
                monthlySalaryCost
            };
        } else {
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            const monthStart = new Date(currentYear, currentMonth, 1);
            const monthEnd = new Date(currentYear, currentMonth + 1, 0);
            
            const monthlyAttendance = await Attendance.countDocuments({
                company: req.user.company,
                employee: req.user._id,
                date: { $gte: monthStart, $lte: monthEnd },
                status: { $in: ['present', 'late'] }
            });
            
            const todayStatus = await Attendance.findOne({
                company: req.user.company,
                employee: req.user._id,
                date: { $gte: today }
            });
            
            const myPendingLeaves = await Leave.countDocuments({
                company: req.user.company,
                employee: req.user._id,
                status: 'pending'
            });
            
            stats = {
                monthlyAttendance,
                todayStatus: todayStatus ? todayStatus.status : 'not-marked',
                pendingLeaves: myPendingLeaves,
                salary: req.user.salary
            };
        }
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});

router.get('/attendance', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const { month, employeeId } = req.query;
        
        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Month parameter is required (format: YYYY-MM)'
            });
        }
        
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0);
        
        let query = {
            company: req.user.company,
            date: { $gte: startDate, $lte: endDate }
        };
        
        if (employeeId) {
            query.employee = employeeId;
        }
        
        const attendance = await Attendance.find(query)
            .populate('employee', 'name designation')
            .sort({ date: 1 });
        
        const report = {};
        
        attendance.forEach(att => {
            const empId = att.employee._id.toString();
            
            if (!report[empId]) {
                report[empId] = {
                    employee: att.employee,
                    present: 0,
                    absent: 0,
                    late: 0,
                    halfDay: 0,
                    records: []
                };
            }
            
            report[empId].records.push({
                date: att.date,
                status: att.status,
                checkIn: att.checkInTime,
                checkOut: att.checkOutTime
            });
            
            if (att.status === 'present') report[empId].present++;
            else if (att.status === 'absent') report[empId].absent++;
            else if (att.status === 'late') report[empId].late++;
            else if (att.status === 'half-day') report[empId].halfDay++;
        });
        
        res.json({
            success: true,
            data: Object.values(report)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating attendance report'
        });
    }
});

router.get('/payroll', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const { month } = req.query;
        
        if (!month) {
            return res.status(400).json({
                success: false,
                message: 'Month parameter is required (format: YYYY-MM)'
            });
        }
        
        const payroll = await Payroll.find({
            company: req.user.company,
            month
        }).populate('employee', 'name designation email');
        
        const totalSalary = payroll.reduce((sum, pay) => sum + pay.totalSalary, 0);
        const totalPaid = payroll.filter(p => p.status === 'paid')
            .reduce((sum, pay) => sum + pay.totalSalary, 0);
        const totalPending = payroll.filter(p => p.status === 'pending')
            .reduce((sum, pay) => sum + pay.totalSalary, 0);
        
        res.json({
            success: true,
            data: {
                records: payroll,
                summary: {
                    totalSalary,
                    totalPaid,
                    totalPending,
                    employeeCount: payroll.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating payroll report'
        });
    }
});

module.exports = router;