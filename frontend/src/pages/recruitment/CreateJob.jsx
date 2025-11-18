import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from 'react-query';
import { ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const jobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  department: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'temporary']),
  workMode: z.enum(['remote', 'on-site', 'hybrid']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  numberOfOpenings: z.number().min(1, 'At least 1 opening required'),
  salaryRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
});

export default function CreateJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [responsibilities, setResponsibilities] = useState(['']);
  const [requirements, setRequirements] = useState(['']);
  const [skills, setSkills] = useState(['']);
  const [benefits, setBenefits] = useState(['']);

  const { data: departments } = useQuery('departments', () =>
    api.get('/departments')
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      employmentType: 'full-time',
      workMode: 'on-site',
      experienceLevel: 'mid',
      numberOfOpenings: 1,
    },
  });

  const addArrayItem = (setter, array) => {
    setter([...array, '']);
  };

  const removeArrayItem = (setter, array, index) => {
    setter(array.filter((_, i) => i !== index));
  };

  const updateArrayItem = (setter, array, index, value) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/recruitment/jobs', {
        ...data,
        numberOfOpenings: Number(data.numberOfOpenings),
        responsibilities: responsibilities.filter((r) => r.trim()),
        requirements: requirements.filter((r) => r.trim()),
        skills: skills.filter((s) => s.trim()),
        benefits: benefits.filter((b) => b.trim()),
        salaryRange: {
          min: data.salaryRange?.min ? Number(data.salaryRange.min) : undefined,
          max: data.salaryRange?.max ? Number(data.salaryRange.max) : undefined,
        },
      });
      toast.success('Job posting created successfully!');
      navigate('/recruitment/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create job posting');
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
          onClick={() => navigate('/recruitment/jobs')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Job Posting</h1>
          <p className="text-gray-600 mt-1">Add a new open position</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Title *"
              placeholder="Senior Software Engineer"
              error={errors.title?.message}
              {...register('title')}
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
              label="Location *"
              placeholder="New York, NY"
              error={errors.location?.message}
              {...register('location')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('employmentType')}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Mode *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('workMode')}
              >
                <option value="on-site">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('experienceLevel')}
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <Input
              label="Number of Openings *"
              type="number"
              min="1"
              error={errors.numberOfOpenings?.message}
              {...register('numberOfOpenings', { valueAsNumber: true })}
            />
            <Input
              label="Application Deadline"
              type="date"
              {...register('applicationDeadline')}
            />
          </div>
        </Card>

        {/* Job Description */}
        <Card title="Job Description">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the role, team, and company culture..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Responsibilities */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Responsibilities
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(setResponsibilities, responsibilities)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Design and develop scalable APIs"
                      value={resp}
                      onChange={(e) =>
                        updateArrayItem(setResponsibilities, responsibilities, index, e.target.value)
                      }
                    />
                    {responsibilities.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          removeArrayItem(setResponsibilities, responsibilities, index)
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Requirements
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(setRequirements, requirements)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 5+ years of experience in Node.js"
                      value={req}
                      onChange={(e) =>
                        updateArrayItem(setRequirements, requirements, index, e.target.value)
                      }
                    />
                    {requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem(setRequirements, requirements, index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(setSkills, skills)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., React, Node.js, MongoDB"
                      value={skill}
                      onChange={(e) => updateArrayItem(setSkills, skills, index, e.target.value)}
                    />
                    {skills.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem(setSkills, skills, index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Compensation & Benefits */}
        <Card title="Compensation & Benefits">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Salary"
                type="number"
                placeholder="50000"
                {...register('salaryRange.min', { valueAsNumber: true })}
              />
              <Input
                label="Maximum Salary"
                type="number"
                placeholder="80000"
                {...register('salaryRange.max', { valueAsNumber: true })}
              />
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Benefits</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(setBenefits, benefits)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Health insurance, 401k matching"
                      value={benefit}
                      onChange={(e) =>
                        updateArrayItem(setBenefits, benefits, index, e.target.value)
                      }
                    />
                    {benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem(setBenefits, benefits, index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/recruitment/jobs')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Job Posting
          </Button>
        </div>
      </form>
    </div>
  );
}