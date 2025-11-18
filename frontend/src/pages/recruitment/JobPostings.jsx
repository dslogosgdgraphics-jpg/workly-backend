import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Eye, Edit, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/helpers';

export default function JobPostings() {
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const { data: jobs, isLoading } = useQuery('job-postings', () =>
    api.get('/recruitment/jobs')
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/recruitment/jobs/${id}`),
    {
      onSuccess: () => {
        toast.success('Job posting deleted successfully');
        queryClient.invalidateQueries('job-postings');
        setShowDeleteModal(false);
      },
      onError: () => {
        toast.error('Failed to delete job posting');
      },
    }
  );

  const publishMutation = useMutation(
    (id) => api.put(`/recruitment/jobs/${id}/publish`),
    {
      onSuccess: () => {
        toast.success('Job posting published successfully');
        queryClient.invalidateQueries('job-postings');
      },
      onError: () => {
        toast.error('Failed to publish job posting');
      },
    }
  );

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'default',
      open: 'success',
      closed: 'danger',
      'on-hold': 'warning',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const columns = [
    {
      header: 'Job Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-sm text-gray-500">{row.location}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (row) => row.department?.name || '-',
    },
    {
      header: 'Type',
      accessor: 'employmentType',
      render: (row) => (
        <Badge variant="info" className="capitalize">
          {row.employmentType}
        </Badge>
      ),
    },
    {
      header: 'Applications',
      accessor: 'applicationCount',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{row.applicationCount || 0}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Posted',
      accessor: 'publishedDate',
      render: (row) => (row.publishedDate ? formatDate(row.publishedDate) : '-'),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => publishMutation.mutate(row._id)}
            >
              Publish
            </Button>
          )}
          <Link to={`/recruitment/jobs/${row._id}/applicants`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          <Link to={`/recruitment/jobs/${row._id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedJob(row);
              setShowDeleteModal(true);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-1">Manage open positions</p>
        </div>
        <Link to="/recruitment/jobs/create">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Create Job Posting
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-900">
              {jobs?.data?.length || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Open Positions</p>
            <p className="text-3xl font-bold text-green-600">
              {jobs?.data?.filter((j) => j.status === 'open').length || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-primary-600">
              {jobs?.data?.reduce((sum, j) => sum + (j.applicationCount || 0), 0) || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Draft Jobs</p>
            <p className="text-3xl font-bold text-gray-600">
              {jobs?.data?.filter((j) => j.status === 'draft').length || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <Table
          columns={columns}
          data={jobs?.data || []}
          loading={isLoading}
          emptyMessage="No job postings found"
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Job Posting"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedJob?.title}</strong>?
            This will also delete all associated applications.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(selectedJob?._id)}
              loading={deleteMutation.isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}