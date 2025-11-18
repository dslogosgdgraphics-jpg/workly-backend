import { useState } from 'react';
import { useQuery } from 'react-query';
import { Calendar, Download, Filter, Clock, UserCheck } from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AttendanceView() {
  const { user } = useAuthStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [todayStatus, setTodayStatus] = useState(null);

  const { data: attendance, isLoading, refetch } = useQuery(
    ['attendance', startDate, endDate],
    () => attendanceApi.getAll({ startDate, endDate })
  );

  const { data: todayData } = useQuery(
    'today-attendance',
    () => attendanceApi.getTodayStatus(),
    {
      onSuccess: (data) => setTodayStatus(data.data),
    }
  );

  const handleCheckIn = async () => {
    try {
      await attendanceApi.checkIn();
      toast.success('Checked in successfully!');
      refetch();
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
      refetch();
      const res = await attendanceApi.getTodayStatus();
      setTodayStatus(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      present: 'success',
      absent: 'danger',
      late: 'warning',
      'half-day': 'info',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => formatDate(row.date),
    },
    ...(user?.role === 'admin' ? [{
      header: 'Employee',
      accessor: 'employee',
      render: (row) => (
        <div>
          <p className="font-medium">{row.employee?.name}</p>
          <p className="text-xs text-gray-500">{row.employee?.designation}</p>
        </div>
      ),
    }] : []),
    {
      header: 'Check In',
      accessor: 'checkInTime',
      render: (row) => row.checkInTime || '-',
    },
    {
      header: 'Check Out',
      accessor: 'checkOutTime',
      render: (row) => row.checkOutTime || '-',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Notes',
      accessor: 'notes',
      render: (row) => row.notes || '-',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Track employee attendance</p>
        </div>
      </div>

      {/* Quick Actions for Employees */}
      {user?.role === 'employee' && (
        <Card title="Today's Attendance">
          <div className="flex items-center justify-between">
            <div>
              {!todayStatus ? (
                <p className="text-gray-600">You haven't checked in today</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>Check In: <strong>{todayStatus.checkInTime}</strong></span>
                  </div>
                  {todayStatus.checkOutTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>Check Out: <strong>{todayStatus.checkOutTime}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-gray-500" />
                    <span>Status: {getStatusBadge(todayStatus.status)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!todayStatus ? (
                <Button onClick={handleCheckIn}>
                  <Clock className="w-5 h-5 mr-2" />
                  Check In
                </Button>
              ) : !todayStatus.checkOutTime ? (
                <Button variant="danger" onClick={handleCheckOut}>
                  <Clock className="w-5 h-5 mr-2" />
                  Check Out
                </Button>
              ) : (
                <Badge variant="success" className="px-4 py-2">
                  ✓ Completed for today
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end gap-2">
            <Button onClick={() => refetch()}>
              <Filter className="w-5 h-5 mr-2" />
              Apply
            </Button>
            <Button variant="outline">
              <Download className="w-5 h-5 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card>
        <Table
          columns={columns}
          data={attendance?.data || []}
          loading={isLoading}
          emptyMessage="No attendance records found"
        />
      </Card>
    </div>
  );
}