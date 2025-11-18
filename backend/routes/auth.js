const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const Company = require('../models/Company');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

router.post('/register', [
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('companyEmail').isEmail().withMessage('Valid company email is required'),
    body('adminName').notEmpty().withMessage('Admin name is required'),
    body('adminEmail').isEmail().withMessage('Valid admin email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
], async (req, res) => {
    try {
        const { companyName, companyEmail, companyPhone, adminName, adminEmail, password } = req.body;
        
        let company = await Company.findOne({ email: companyEmail.toLowerCase() });
        if (company) {
            return res.status(400).json({
                success: false,
                message: 'Company with this email already exists'
            });
        }
        
        company = await Company.create({
            name: companyName,
            email: companyEmail.toLowerCase(),
            phone: companyPhone,
            subscriptionPlan: 'trial',
            subscriptionStatus: 'active',
            maxEmployees: 999999
        });
        
        const admin = await User.create({
            company: company._id,
            name: adminName,
            email: adminEmail.toLowerCase(),
            password,
            designation: 'Administrator',
            salary: 0,
            role: 'admin'
        });
        
        const token = admin.generateAuthToken();
        
        res.status(201).json({
            success: true,
            message: 'Company registered successfully',
            data: {
                token,
                user: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    company: {
                        id: company._id,
                        name: company.name,
                        subscriptionPlan: company.subscriptionPlan
                    }
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error registering company'
        });
    }
});

router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password')
            .populate('company', 'name subscriptionPlan subscriptionStatus subscriptionEndDate');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Your account is inactive. Please contact admin.'
            });
        }
        
        const token = user.generateAuthToken();
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    designation: user.designation,
                    salary: user.salary,
                    company: {
                        id: user.company._id,
                        name: user.company.name,
                        subscriptionPlan: user.company.subscriptionPlan
                    }
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
});

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('company', 'name subscriptionPlan subscriptionStatus');
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
});

module.exports = router;