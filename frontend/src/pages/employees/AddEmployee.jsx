import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from 'react-query';
import { ArrowLeft, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employees';
import { departmentApi } from '../../api/departments';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  designation: z.string().min(2, 'Designation is required'),
  department: z.string().optional(),
  salary: z.number().min(0, 'Salary must be positive'),
  role: z.enum(['admin', 'employee']),
  joinDate: z.string(),
  birthDate: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export default function AddEmployee() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const { data: departments } = useQuery('departments', departmentApi.getAll);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: 'employee',
      joinDate: new Date().toISOString().split('T')[0],
    },
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Convert salary to number
      data.salary = Number(data.salary);
      
      await employeeApi.create(data);
      toast.success('Employee added successfully!');
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/employees')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-600 mt-1">Fill in the employee details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Photo */}
        <Card title="Profile Photo">
          <div className="flex items-center gap-6">
            <div className="relative">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setProfilePhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" as="span">
                  Choose Photo
                </Button>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="john@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Phone Number"
              placeholder="+1 234 567 8900"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Designation *"
              placeholder="Software Engineer"
              error={errors.designation?.message}
              {...register('designation')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('department')}
              >
                <option value="">Select Department</option>
                {departments?.data?.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Salary *"
              type="number"
              placeholder="50000"
              error={errors.salary?.message}
              {...register('salary', { valueAsNumber: true })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('role')}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Input
              label="Join Date *"
              type="date"
              error={errors.joinDate?.message}
              {...register('joinDate')}
            />
            <Input
              label="Birth Date"
              type="date"
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />
          </div>
        </Card>

        {/* Address */}
        <Card title="Address Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Street Address"
              placeholder="123 Main St"
              {...register('address.street')}
            />
            <Input
              label="City"
              placeholder="New York"
              {...register('address.city')}
            />
            <Input
              label="State/Province"
              placeholder="NY"
              {...register('address.state')}
            />
            <Input
              label="Country"
              placeholder="United States"
              {...register('address.country')}
            />
            <Input
              label="Zip/Postal Code"
              placeholder="10001"
              {...register('address.zipCode')}
            />
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card title="Emergency Contact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Name"
              placeholder="Jane Doe"
              {...register('emergencyContact.name')}
            />
            <Input
              label="Relationship"
              placeholder="Spouse"
              {...register('emergencyContact.relationship')}
            />
            <Input
              label="Contact Phone"
              placeholder="+1 234 567 8900"
              {...register('emergencyContact.phone')}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/employees')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Employee
          </Button>
        </div>
      </form>
    </div>
  );
}