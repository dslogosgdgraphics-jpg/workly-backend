import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Search, Filter, Mail, Phone, Download } from 'lucide-react';
import { employeeApi } from '../../api/employees';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';

export default function EmployeeList() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: employees, isLoading } = useQuery('employees', () => 
    employeeApi.getAll()
  );

  const filteredEmployees = employees?.data?.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">
            Manage your team members
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/employees/add">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Add Employee
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search employees..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-5 h-5 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Link key={employee._id} to={`/employees/${employee._id}`}>
              <Card hover className="h-full">
                <div className="text-center">
                  <Avatar
                    src={employee.profilePhoto}
                    name={employee.name}
                    size="xl"
                    className="mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {employee.designation}
                  </p>
                  <Badge 
                    variant={employee.status === 'active' ? 'success' : 'danger'}
                    className="mb-4"
                  >
                    {employee.status}
                  </Badge>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{employee.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filteredEmployees.length === 0 && !isLoading && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No employees found</p>
          </div>
        </Card>
      )}
    </div>
  );
}