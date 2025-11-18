import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { leaveApi } from '../../api/leaves';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const leaveSchema = z.object({
  type: z.enum(['sick', 'casual', 'annual', 'unpaid']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(leaveSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await leaveApi.apply(data);
      toast.success('Leave request submitted successfully!');
      navigate('/leaves');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/leaves')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
          <p className="text-gray-600 mt-1">Submit your leave request</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('type')}
              >
                <option value="">Select Type</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                type="date"
                error={errors.startDate?.message}
                {...register('startDate')}
              />
              <Input
                label="End Date *"
                type="date"
                error={errors.endDate?.message}
                {...register('endDate')}
              />
            </div>

            {calculateDays() > 0 && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-800">
                  <strong>Duration:</strong> {calculateDays()} day{calculateDays() > 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Please provide a detailed reason for your leave..."
                {...register('reason')}
              />
              {errors.reason && (
                <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
              )}
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/leaves')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}