export const LEAVE_TYPES = {
  sick: { label: 'Sick Leave', color: 'red' },
  casual: { label: 'Casual Leave', color: 'blue' },
  annual: { label: 'Annual Leave', color: 'green' },
  unpaid: { label: 'Unpaid Leave', color: 'gray' },
};

export const ATTENDANCE_STATUS = {
  present: { label: 'Present', color: 'green' },
  absent: { label: 'Absent', color: 'red' },
  late: { label: 'Late', color: 'yellow' },
  'half-day': { label: 'Half Day', color: 'blue' },
};

export const PAYROLL_STATUS = {
  pending: { label: 'Pending', color: 'yellow' },
  paid: { label: 'Paid', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
};

export const EMPLOYEE_STATUS = {
  active: { label: 'Active', color: 'green' },
  inactive: { label: 'Inactive', color: 'gray' },
  suspended: { label: 'Suspended', color: 'red' },
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';