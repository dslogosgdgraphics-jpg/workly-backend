import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Download, DollarSign } from 'lucide-react';
import { payrollApi } from '../../api/payroll';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { formatCurrency } from '../../utils/helpers';

export default function PayrollList() {
  const { user } = useAuthStore();
  const [monthFilter, setMonthFilter] = useState('');

  const { data: payroll, isLoading } = useQuery(
    ['payroll', monthFilter],
    () => payrollApi.getAll({ month: monthFilter })
  );

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      paid: 'success',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
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
      header: 'Month',
      accessor: 'month',
    },
    {
      header: 'Days',
      accessor: 'daysPresent',
      render: (row) => `${row.daysPresent}/${row.totalDays}`,
    },
    {
      header: 'Basic Salary',
      accessor: 'basicSalary',
      render: (row) => formatCurrency(row.basicSalary),
    },
    {
      header: 'Deductions',
      accessor: 'deductions',
      render: (row) => formatCurrency(row.deductions),
    },
    {
      header: 'Total Salary',
      accessor: 'totalSalary',
      render: (row) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(row.totalSalary)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          Payslip
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">Manage employee salaries</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/payroll/generate">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Generate Payroll
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Payroll Table */}
      <Card>
        <Table
          columns={columns}
          data={payroll?.data || []}
          loading={isLoading}
          emptyMessage="No payroll records found"
        />
      </Card>
    </div>
  );
}