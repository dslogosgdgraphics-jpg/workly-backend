import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, User, Lock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  companyEmail: z.string().email('Invalid email address'),
  companyPhone: z.string().optional(),
  adminName: z.string().min(2, 'Your name is required'),
  adminEmail: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      setAuth(response.data.user, response.data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-2xl font-bold text-primary-600">E</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">EmplyStack</h1>
          <p className="text-primary-100">Create your company account</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
          <p className="text-gray-600 mb-6">Start managing your employees today</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                
                <Input
                  label="Company Name"
                  icon={Building2}
                  placeholder="Acme Inc."
                  error={errors.companyName?.message}
                  {...register('companyName')}
                />

                <Input
                  label="Company Email"
                  type="email"
                  icon={Mail}
                  placeholder="company@example.com"
                  error={errors.companyEmail?.message}
                  {...register('companyEmail')}
                />

                <Input
                  label="Company Phone (Optional)"
                  icon={Phone}
                  placeholder="+1 234 567 8900"
                  error={errors.companyPhone?.message}
                  {...register('companyPhone')}
                />

                <Button type="button" className="w-full" onClick={() => setStep(2)}>
                  Continue
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Account</h3>
                
                <Input
                  label="Your Name"
                  icon={User}
                  placeholder="John Doe"
                  error={errors.adminName?.message}
                  {...register('adminName')}
                />

                <Input
                  label="Your Email"
                  type="email"
                  icon={Mail}
                  placeholder="you@company.com"
                  error={errors.adminEmail?.message}
                  {...register('adminEmail')}
                />

                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" loading={loading}>
                    Create Account
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}