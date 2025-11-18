import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Calendar, Filter } from 'lucide-react';
import { leaveApi } from '../../api/leaves';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { formatDate } from '../../utils/helpers';

export default function LeaveList() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: leaves, isLoading } = useQuery(
    ['leaves', statusFilter],
    () => leaveApi.getAll({ status: statusFilter })
  );

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      sick: 'danger',
      casual: 'info',
      annual: 'primary',
      unpaid: 'default',
    };
    return <Badge variant={variants[type]}>{type}</Badge>;
  };

  const columns = [
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
      header: 'Type',
      accessor: 'type',
      render: (row) => getTypeBadge(row.type),
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      render: (row) => formatDate(row.startDate),
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      render: (row) => formatDate(row.endDate),
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (row) => {
        const days = Math.ceil((new Date(row.endDate) - new Date(row.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        return `${days} day${days > 1 ? 's' : ''}`;
      },
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (row) => (
        <div className="max-w-xs truncate" title={row.reason}>
          {row.reason}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Applied On',
      accessor: 'createdAt',
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-600 mt-1">Manage leave applications</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Link to="/leaves/approvals">
              <Button variant="outline">
                <Calendar className="w-5 h-5 mr-2" />
                Pending Approvals
              </Button>
            </Link>
          )}
          <Link to="/leaves/apply">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Apply Leave
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Leave Table */}
      <Card>
        <Table
          columns={columns}
          data={leaves?.data || []}
          loading={isLoading}
          emptyMessage="No leave requests found"
        />
      </Card>
    </div>
  );
}