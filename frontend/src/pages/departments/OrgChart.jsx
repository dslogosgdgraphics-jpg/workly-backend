import React, { useState, useEffect } from 'react';
import { Search, Download, ZoomIn, ZoomOut, Grid, List, Users, ChevronDown, ChevronRight, Mail, Phone, Building2, Briefcase } from 'lucide-react';
import { employeesAPI } from '../../api/employees';
import { departmentsAPI } from '../../api/departments';

const OrgChart = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // tree, list
  const [zoom, setZoom] = useState(100);
  const [expandedDepts, setExpandedDepts] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        employeesAPI.getAll(),
        departmentsAPI.getAll()
      ]);

      if (empRes.success && deptRes.success) {
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
        
        // Auto-expand all departments by default
        const expanded = {};
        deptRes.data.forEach(dept => {
          expanded[dept._id] = true;
        });
        setExpandedDepts(expanded);
      }
    } catch (err) {
      setError('Failed to load organization chart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (deptId) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleExport = () => {
    // Simple CSV export
    const csvData = employees.map(emp => ({
      Name: emp.name,
      Email: emp.email,
      Department: emp.department?.name || 'Unassigned',
      Designation: emp.designation,
      Manager: emp.manager?.name || 'None'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'org-chart.csv';
    a.click();
  };

  const getEmployeesByDepartment = (deptId) => {
    return employees.filter(emp => emp.department?._id === deptId || emp.department === deptId);
  };

  const getUnassignedEmployees = () => {
    return employees.filter(emp => !emp.department);
  };

  const getManagersInDepartment = (deptId) => {
    const deptEmployees = getEmployeesByDepartment(deptId);
    // Find employees who are managers (have direct reports)
    return deptEmployees.filter(emp => 
      deptEmployees.some(e => e.manager === emp._id || e.manager?._id === emp._id)
    );
  };

  const getDirectReports = (managerId) => {
    return employees.filter(emp => 
      emp.manager === managerId || emp.manager?._id === managerId
    );
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getEmployeesByDepartment(dept._id).some(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Employee Card Component
  const EmployeeCard = ({ employee, isManager = false, level = 0 }) => {
    const [showReports, setShowReports] = useState(true);
    const directReports = getDirectReports(employee._id);

    return (
      <div className="relative" style={{ marginLeft: level > 0 ? '40px' : '0' }}>
        <div className="group relative">
          {/* Connecting Line */}
          {level > 0 && (
            <div className="absolute left-[-20px] top-1/2 w-5 h-0.5 bg-gradient-to-r from-indigo-200 to-indigo-400"></div>
          )}

          {/* Employee Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-4 mb-4 border-l-4 border-indigo-500 hover:border-purple-500 transform hover:-translate-y-1">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                {employee.profilePhoto ? (
                  <img
                    src={employee.profilePhoto}
                    alt={employee.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-4 ring-indigo-100">
                    <span className="text-white text-xl font-bold">
                      {employee.name.charAt(0)}
                    </span>
                  </div>
                )}
                {employee.status === 'active' && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {employee.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      <p className="text-sm text-gray-600">{employee.designation}</p>
                    </div>
                  </div>
                  {isManager && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 text-xs font-semibold rounded-full">
                      Manager
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  {employee.department?.name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{employee.department.name}</span>
                    </div>
                  )}
                </div>

                {directReports.length > 0 && (
                  <button
                    onClick={() => setShowReports(!showReports)}
                    className="mt-3 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {showReports ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <Users className="w-4 h-4" />
                    <span>{directReports.length} Direct Report{directReports.length !== 1 ? 's' : ''}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Direct Reports */}
        {directReports.length > 0 && showReports && (
          <div className="ml-4 border-l-2 border-indigo-200 pl-2">
            {directReports.map(report => (
              <EmployeeCard
                key={report._id}
                employee={report}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Department Section Component
  const DepartmentSection = ({ department }) => {
    const deptEmployees = getEmployeesByDepartment(department._id);
    const managers = getManagersInDepartment(department._id);
    const isExpanded = expandedDepts[department._id];

    // Get top-level employees (managers or those without managers in this dept)
    const topLevelEmployees = deptEmployees.filter(emp => {
      const hasManagerInDept = emp.manager && deptEmployees.some(e => 
        e._id === emp.manager || e._id === emp.manager?._id
      );
      return !hasManagerInDept;
    });

    return (
      <div className="mb-8">
        {/* Department Header */}
        <div
          onClick={() => toggleDepartment(department._id)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {department.name}
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {deptEmployees.length} {deptEmployees.length === 1 ? 'Employee' : 'Employees'}
                  </span>
                </h2>
                {department.description && (
                  <p className="text-indigo-100 mt-1">{department.description}</p>
                )}
                {department.head && (
                  <p className="text-white/90 mt-2 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Head: {department.head.name || 'Unassigned'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {managers.length > 0 && (
                <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                  {managers.length} Manager{managers.length !== 1 ? 's' : ''}
                </span>
              )}
              {isExpanded ? (
                <ChevronDown className="w-6 h-6 text-white" />
              ) : (
                <ChevronRight className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Department Employees */}
        {isExpanded && (
          <div className="mt-6 pl-4">
            {topLevelEmployees.length > 0 ? (
              topLevelEmployees.map(emp => (
                <EmployeeCard
                  key={emp._id}
                  employee={emp}
                  isManager={managers.some(m => m._id === emp._id)}
                />
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No employees in this department</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // List View Component
  const ListView = () => {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Employee</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Designation</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Department</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Manager</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEmployees.map((emp, idx) => (
              <tr key={emp._id} className="hover:bg-indigo-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {emp.profilePhoto ? (
                      <img
                        src={emp.profilePhoto}
                        alt={emp.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">{emp.designation}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {emp.department?.name || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {emp.manager?.name || '—'}
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {emp.phone || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading organization chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Organization Chart
        </h1>
        <p className="text-gray-600">Visualize your company structure and team hierarchy</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees, departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'tree'
                    ? 'bg-white shadow-md text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="font-medium">Tree</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white shadow-md text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="font-medium">List</span>
              </button>
            </div>

            {/* Zoom Controls (Tree view only) */}
            {viewMode === 'tree' && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-white rounded-md transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                <span className="px-3 text-sm font-medium text-gray-700">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-white rounded-md transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Employees</p>
              <p className="text-3xl font-bold">{employees.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Departments</p>
              <p className="text-3xl font-bold">{departments.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">Managers</p>
              <p className="text-3xl font-bold">
                {employees.filter(emp => 
                  employees.some(e => e.manager === emp._id || e.manager?._id === emp._id)
                ).length}
              </p>
            </div>
            <Briefcase className="w-12 h-12 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium mb-1">Avg Team Size</p>
              <p className="text-3xl font-bold">
                {departments.length > 0 
                  ? Math.round(employees.length / departments.length)
                  : 0}
              </p>
            </div>
            <Users className="w-12 h-12 text-pink-200" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
        {viewMode === 'tree' ? (
          <div className="space-y-8">
            {/* Departments */}
            {filteredDepartments.map(dept => (
              <DepartmentSection key={dept._id} department={dept} />
            ))}

            {/* Unassigned Employees */}
            {getUnassignedEmployees().length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Unassigned Employees
                      </h2>
                      <p className="text-gray-100 mt-1">
                        {getUnassignedEmployees().length} employees without department
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pl-4">
                  {getUnassignedEmployees().map(emp => (
                    <EmployeeCard key={emp._id} employee={emp} />
                  ))}
                </div>
              </div>
            )}

            {filteredDepartments.length === 0 && getUnassignedEmployees().length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        ) : (
          <ListView />
        )}
      </div>
    </div>
  );
};

export default OrgChart;
