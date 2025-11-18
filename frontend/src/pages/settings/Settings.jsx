// frontend/src/pages/settings/Settings.jsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  User, 
  Lock, 
  Clock, 
  DollarSign, 
  Bell, 
  Shield,
  Calendar,
  Briefcase,
  Save,
  Upload,
  AlertCircle
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  // Company Settings
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    logo: '',
    settings: {
      workingDaysPerWeek: 6,
      workingHoursPerDay: 8,
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      lateMarkTime: '09:15',
      halfDayHours: 4,
      weekendDays: ['Sunday']
    }
  });

  // User Profile
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: ''
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    leaveRequests: true,
    attendanceAlerts: true,
    payrollUpdates: true,
    systemAnnouncements: true
  });

  // Tabs Configuration
  const tabs = [
    { id: 'company', label: 'Company', icon: Building2, adminOnly: true },
    { id: 'profile', label: 'Profile', icon: User, adminOnly: false },
    { id: 'security', label: 'Security', icon: Lock, adminOnly: false },
    { id: 'attendance', label: 'Attendance', icon: Clock, adminOnly: true },
    { id: 'leave', label: 'Leave Policies', icon: Calendar, adminOnly: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, adminOnly: false },
    { id: 'subscription', label: 'Subscription', icon: DollarSign, adminOnly: true }
  ];

  const filteredTabs = tabs.filter(tab => !tab.adminOnly || user?.role === 'admin');

  // Fetch Settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      if (user?.role === 'admin') {
        const { data } = await axios.get('/api/company/settings');
        setCompanyData(data.data);
        setLogoPreview(data.data.logo);
      }
      
      const { data: userData } = await axios.get('/api/auth/me');
      setProfileData({
        name: userData.data.name,
        email: userData.data.email,
        phone: userData.data.phone || '',
        designation: userData.data.designation
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle Company Settings Update
  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/company/settings', companyData);
      toast.success('Company settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size should be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const { data } = await axios.post('/api/company/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogoPreview(data.data.logo);
      setCompanyData(prev => ({ ...prev, logo: data.data.logo }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    }
  };

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/employees/profile', profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Handle Notification Settings Update
  const handleNotificationUpdate = async () => {
    setSaving(true);
    try {
      await axios.put('/api/users/notification-settings', notificationSettings);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your account and company preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Company Settings */}
        {activeTab === 'company' && user?.role === 'admin' && (
          <form onSubmit={handleCompanyUpdate} className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              
              {/* Logo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    <p className="mt-2 text-xs text-gray-500">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyData.name}
                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={companyData.settings.timezone}
                    onChange={(e) => setCompanyData({ 
                      ...companyData, 
                      settings: { ...companyData.settings, timezone: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    rows="3"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Days/Week</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={companyData.settings.workingDaysPerWeek}
                    onChange={(e) => setCompanyData({ 
                      ...companyData, 
                      settings: { ...companyData.settings, workingDaysPerWeek: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours/Day</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={companyData.settings.workingHoursPerDay}
                    onChange={(e) => setCompanyData({ 
                      ...companyData, 
                      settings: { ...companyData.settings, workingHoursPerDay: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={companyData.settings.currency}
                    onChange={(e) => setCompanyData({ 
                      ...companyData, 
                      settings: { ...companyData.settings, currency: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="PKR">PKR - Pakistani Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    value={profileData.designation}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{saving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Attendance Settings */}
        {activeTab === 'attendance' && user?.role === 'admin' && (
          <form onSubmit={handleCompanyUpdate} className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Late Mark After</label>
                  <input
                    type="time"
                    value={companyData.settings.lateMarkTime || '09:15'}
                    onChange={(e) => setCompanyData({ 
                      ...companyData, 
                      settings: { ...companyData.settings, lateMarkTime: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Employees checking in after this time will be marked late</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Half Day Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={companyData.settings.halfDayHours || 4}
                    onChange={(e) => setCompanyData({ 
                      ...companyData, 
                      settings: { ...companyData.settings, halfDayHours: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum hours for half-day attendance</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Leave Policies */}
        {activeTab === 'leave' && user?.role === 'admin' && (
          <div className="p-6">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Leave Policy Configuration</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Leave policies are configured per employee. You can set annual leave quotas, sick leave allowances, 
                  and other policies when adding or editing employee details.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Default Leave Types</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Annual Leave</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Sick Leave</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Casual Leave</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Unpaid Leave</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Approval Workflow</h4>
                <p className="text-sm text-gray-600">
                  All leave requests require admin approval. Employees can view their leave balance 
                  and apply for leaves through the Leave Management section.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email notifications for important updates' },
                  { key: 'leaveRequests', label: 'Leave Requests', desc: 'Notifications about leave applications and approvals' },
                  { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'Daily attendance reminders and alerts' },
                  { key: 'payrollUpdates', label: 'Payroll Updates', desc: 'Notifications about salary and payslip generation' },
                  { key: 'systemAnnouncements', label: 'System Announcements', desc: 'Company-wide announcements and updates' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key]}
                        onChange={(e) => setNotificationSettings({ 
                          ...notificationSettings, 
                          [item.key]: e.target.checked 
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={handleNotificationUpdate}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Subscription */}
        {activeTab === 'subscription' && user?.role === 'admin' && (
          <div className="p-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-indigo-900">Current Plan</h4>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {user?.company?.subscriptionPlan || 'Trial'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {user?.company?.subscriptionStatus || 'Active'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Max Employees</p>
                      <p className="text-lg font-semibold text-gray-900">Unlimited</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Features Included</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Unlimited Employees</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Attendance Tracking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Leave Management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Payroll Management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Reports & Analytics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Document Management</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Performance Reviews</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Onboarding</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;