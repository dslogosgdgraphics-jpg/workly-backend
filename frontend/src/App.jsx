import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import AddEmployee from './pages/employees/AddEmployee';
import AttendanceView from './pages/attendance/AttendanceView';
import LeaveList from './pages/leaves/LeaveList';
import ApplyLeave from './pages/leaves/ApplyLeave';
import LeaveApprovals from './pages/leaves/LeaveApprovals';
import PayrollList from './pages/payroll/PayrollList';
import GeneratePayroll from './pages/payroll/GeneratePayroll';
import DepartmentList from './pages/departments/DepartmentList';
import OrgChart from './pages/departments/OrgChart';
import DocumentList from './pages/documents/DocumentList';
import PerformanceList from './pages/performance/PerformanceList';
import OnboardingView from './pages/onboarding/OnboardingView';
import ExpenseList from './pages/expenses/ExpenseList';
import AnnouncementFeed from './pages/announcements/AnnouncementFeed';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Employees */}
        <Route path="employees">
          <Route index element={<EmployeeList />} />
          <Route path="add" element={
            <ProtectedRoute adminOnly>
              <AddEmployee />
            </ProtectedRoute>
          } />
          <Route path=":id" element={<EmployeeDetails />} />
        </Route>

        {/* Attendance */}
        <Route path="attendance" element={<AttendanceView />} />

        {/* Leaves */}
        <Route path="leaves">
          <Route index element={<LeaveList />} />
          <Route path="apply" element={<ApplyLeave />} />
          <Route path="approvals" element={
            <ProtectedRoute adminOnly>
              <LeaveApprovals />
            </ProtectedRoute>
          } />
        </Route>

        {/* Payroll */}
        <Route path="payroll">
          <Route index element={<PayrollList />} />
          <Route path="generate" element={
            <ProtectedRoute adminOnly>
              <GeneratePayroll />
            </ProtectedRoute>
          } />
        </Route>

        {/* Departments */}
        <Route path="departments">
          <Route index element={
            <ProtectedRoute adminOnly>
              <DepartmentList />
            </ProtectedRoute>
          } />
          <Route path="org-chart" element={<OrgChart />} />
        </Route>

        {/* Documents */}
        <Route path="documents" element={<DocumentList />} />

        {/* Performance */}
        <Route path="performance" element={<PerformanceList />} />

        {/* Onboarding */}
        <Route path="onboarding" element={<OnboardingView />} />

        {/* Expenses */}
        <Route path="expenses" element={<ExpenseList />} />

        {/* Announcements */}
        <Route path="announcements" element={<AnnouncementFeed />} />

        {/* Reports */}
        <Route path="reports" element={
          <ProtectedRoute adminOnly>
            <Reports />
          </ProtectedRoute>
        } />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;