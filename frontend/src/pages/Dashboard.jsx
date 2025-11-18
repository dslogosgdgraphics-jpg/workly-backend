import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Users, 
  UserCheck, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Calendar,
  FileText,
  AlertCircle 
} from 'lucide-react';
import { reportApi } from '../api/reports';
import { attendanceApi } from '../api/attendance';
import { useAuthStore } from '../store/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [todayStatus, setTodayStatus] = useState(null);

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery('dashboard-stats', reportApi.getDashboard);

  // Fetch today's attendance status
  useEffect(() => {
    if (user?.role === 'employee') {
      attendanceApi.getTodayStatus().then((res) => {
        setTodayStatus(res.data);
      });
    }
  }, [user]);

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      toast.success('Checked in successfully!');
      const res = await attendanceApi.getTodayStatus();
      setTodayStatus(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceApi.checkOut();
      toast.success('Checked out successfully!');
      const res = await attendanceApi.getTodayStatus();
      setTodayStatus(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! 👋
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Quick Actions for Employees */}
      {user?.role === 'employee' && (
        <Card title="Quick Actions">
          <div className="flex items-center gap-4">
            {!todayStatus ? (
              <Button onClick={handleCheckIn} size="lg">
                <Clock className="w-5 h-5 mr-2" />
                Check In
              </Button>
            ) : !todayStatus.checkOutTime ? (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <UserCheck className="w-5 h-5" />
                  <span>Checked in at {todayStatus.checkInTime}</span>
                </div>
                <Button onClick={handleCheckOut} variant="danger" size="lg">
                  <Clock className="w-5 h-5 mr-2" />
                  Check Out
                </Button>
              </>
            ) : (
              <div className="text-gray-600">
                <p>✅ You've checked out for today</p>
                <p className="text-sm">Check-in: {todayStatus.checkInTime} | Check-out: {todayStatus.checkOutTime}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'admin' ? (
          <>
            <StatsCard
              title="Total Employees"
              value={stats?.data?.totalEmployees || 0}
              icon={Users}
              color="bg-blue-500"
              trend="+12%"
            />
            <StatsCard
              title="Present Today"
              value={stats?.data?.presentToday || 0}
              icon={UserCheck}
              color="bg-green-500"
              trend="+5%"
            />
            <StatsCard
              title="Pending Leaves"
              value={stats?.data?.pendingLeaves || 0}
              icon={Calendar}
              color="bg-yellow-500"
            />
            <StatsCard
              title="Monthly Salary Cost"
              value={formatCurrency(stats?.data?.monthlySalaryCost || 0)}
              icon={DollarSign}
              color="bg-purple-500"
            />
          </>
        ) : (
          <>
            <StatsCard
              title="Attendance This Month"
              value={`${stats?.data?.monthlyAttendance || 0} days`}
              icon={Calendar}
              color="bg-blue-500"
            />
            <StatsCard
              title="Today's Status"
              value={stats?.data?.todayStatus || 'Not Marked'}
              icon={Clock}
              color="bg-green-500"
            />
            <StatsCard
              title="Pending Leaves"
              value={stats?.data?.pendingLeaves || 0}
              icon={FileText}
              color="bg-yellow-500"
            />
            <StatsCard
              title="Your Salary"
              value={formatCurrency(stats?.data?.salary || 0)}
              icon={DollarSign}
              color="bg-purple-500"
            />
          </>
        )}
      </div>

      {/* Charts */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Attendance Trends">
            <LineChart
              data={[
                { month: 'Jan', attendance: 85 },
                { month: 'Feb', attendance: 88 },
                { month: 'Mar', attendance: 92 },
                { month: 'Apr', attendance: 87 },
                { month: 'May', attendance: 90 },
                { month: 'Jun', attendance: 94 },
              ]}
              dataKey="attendance"
              xAxisKey="month"
            />
          </Card>

          <Card title="Department Distribution">
            <BarChart
              data={[
                { department: 'Engineering', employees: 45 },
                { department: 'Sales', employees: 32 },
                { department: 'Marketing', employees: 28 },
                { department: 'HR', employees: 12 },
                { department: 'Finance', employees: 15 },
              ]}
              dataKey="employees"
              xAxisKey="department"
            />
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-4">
          <ActivityItem
            icon={UserCheck}
            title="New Employee Added"
            description="John Doe joined the Engineering team"
            time="2 hours ago"
          />
          <ActivityItem
            icon={Calendar}
            title="Leave Approved"
            description="Sarah's vacation leave has been approved"
            time="4 hours ago"
          />
          <ActivityItem
            icon={DollarSign}
            title="Payroll Generated"
            description="Monthly payroll for June 2024 has been processed"
            time="1 day ago"
          />
        </div>
      </Card>
    </div>
  );
}

// Helper Components
function StatsCard({ title, value, icon: Icon, color, trend }) {
  return (
    <Card hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

function ActivityItem({ icon: Icon, title, description, time }) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}