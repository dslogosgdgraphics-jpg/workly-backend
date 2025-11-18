import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  MapPin,
  Edit,
  Trash2,
  Award,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeApi } from '../../api/employees';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: employee, isLoading } = useQuery(
    ['employee', id],
    () => employeeApi.getById(id)
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeApi.delete(id);
      toast.success('Employee deleted successfully');
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const emp = employee?.data;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/employees')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar
            src={emp?.profilePhoto}
            name={emp?.name}
            size="xl"
            className="w-32 h-32"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{emp?.name}</h2>
                <p className="text-lg text-gray-600 mt-1">{emp?.designation}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={emp?.status === 'active' ? 'success' : 'danger'}>
                    {emp?.status}
                  </Badge>
                  <Badge variant="primary" className="capitalize">
                    {emp?.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <InfoItem icon={Mail} label="Email" value={emp?.email} />
              <InfoItem icon={Phone} label="Phone" value={emp?.phone || 'N/A'} />
              <InfoItem 
                icon={Calendar} 
                label="Join Date" 
                value={formatDate(emp?.joinDate)} 
              />
              <InfoItem 
                icon={DollarSign} 
                label="Salary" 
                value={formatCurrency(emp?.salary)} 
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card title="Personal Information">
          <div className="space-y-3">
            <DetailRow label="Birth Date" value={emp?.birthDate ? formatDate(emp.birthDate) : 'N/A'} />
            <DetailRow label="Department" value={emp?.department?.name || 'N/A'} />
            <DetailRow 
              label="Address" 
              value={emp?.address ? 
                `${emp.address.street || ''}, ${emp.address.city || ''}, ${emp.address.state || ''}, ${emp.address.country || ''}` 
                : 'N/A'
              } 
            />
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card title="Emergency Contact">
          <div className="space-y-3">
            <DetailRow 
              label="Contact Name" 
              value={emp?.emergencyContact?.name || 'N/A'} 
            />
            <DetailRow 
              label="Relationship" 
              value={emp?.emergencyContact?.relationship || 'N/A'} 
            />
            <DetailRow 
              label="Phone" 
              value={emp?.emergencyContact?.phone || 'N/A'} 
            />
          </div>
        </Card>

        {/* Bank Details */}
        <Card title="Bank Details">
          <div className="space-y-3">
            <DetailRow 
              label="Bank Name" 
              value={emp?.bankDetails?.bankName || 'N/A'} 
            />
            <DetailRow 
              label="Account Number" 
              value={emp?.bankDetails?.accountNumber || 'N/A'} 
            />
            <DetailRow 
              label="Account Holder" 
              value={emp?.bankDetails?.accountHolderName || 'N/A'} 
            />
          </div>
        </Card>

        {/* Skills */}
        <Card title="Skills & Expertise">
          {emp?.skills && emp.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {emp.skills.map((skill, index) => (
                <Badge key={index} variant="primary">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills added</p>
          )}
        </Card>
      </div>

      {/* Education */}
      {emp?.education && emp.education.length > 0 && (
        <Card title="Education">
          <div className="space-y-4">
            {emp.education.map((edu, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.year}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Employment History */}
      {emp?.employmentHistory && emp.employmentHistory.length > 0 && (
        <Card title="Employment History">
          <div className="space-y-4">
            {emp.employmentHistory.map((job, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{job.position}</h4>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(job.startDate)} - {job.endDate ? formatDate(job.endDate) : 'Present'}
                  </p>
                  {job.description && (
                    <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Employee"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{emp?.name}</strong>? This action cannot be undone and will also delete all related data (attendance, leaves, payroll, etc.).
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Helper Components
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}