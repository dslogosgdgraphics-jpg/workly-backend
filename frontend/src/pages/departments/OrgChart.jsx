import { useState, useEffect } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrgChart = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch departments and employees
    fetchOrgData();
  }, []);

  const fetchOrgData = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockData = [
        {
          id: '1',
          name: 'Executive',
          manager: 'CEO',
          employees: 1,
          children: [
            {
              id: '2',
              name: 'Engineering',
              manager: 'CTO',
              employees: 15,
              children: []
            },
            {
              id: '3',
              name: 'Sales',
              manager: 'VP Sales',
              employees: 10,
              children: []
            },
            {
              id: '4',
              name: 'HR',
              manager: 'HR Director',
              employees: 5,
              children: []
            }
          ]
        }
      ];

      setDepartments(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching org data:', error);
      setLoading(false);
    }
  };

  const exportChart = () => {
    // TODO: Implement chart export functionality
    alert('Export functionality coming soon!');
  };

  const renderDepartmentCard = (dept, level = 0) => {
    return (
      <div key={dept.id} className="mb-6">
        <div 
          className={`bg-white rounded-lg shadow-md border-2 border-indigo-200 p-6 hover:shadow-lg transition-shadow ${
            level === 0 ? 'border-indigo-600' : ''
          }`}
          style={{ marginLeft: level > 0 ? '40px' : '0' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
              <p className="text-sm text-gray-600 mt-1">Manager: {dept.manager}</p>
              <p className="text-sm text-gray-500 mt-1">
                {dept.employees} {dept.employees === 1 ? 'Employee' : 'Employees'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
              level === 0 ? 'bg-indigo-600' : 'bg-indigo-400'
            }`}>
              {dept.employees}
            </div>
          </div>
        </div>

        {dept.children && dept.children.length > 0 && (
          <div className="mt-4">
            {dept.children.map(child => renderDepartmentCard(child, level + 1))}
          </div>
        )}
      </div>
    );
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/departments')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
              <p className="mt-2 text-sm text-gray-600">
                Visual representation of your company structure
              </p>
            </div>
          </div>

          <button
            onClick={exportChart}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Chart</span>
          </button>
        </div>
      </div>

      {/* Organization Chart */}
      <div className="bg-gray-50 rounded-lg p-6">
        {departments.length > 0 ? (
          <div className="space-y-4">
            {departments.map(dept => renderDepartmentCard(dept))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No departments found</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Top Level Department</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Sub Department</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-indigo-200 rounded-full"></div>
            <span className="text-sm text-gray-600">Number = Employee Count</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
