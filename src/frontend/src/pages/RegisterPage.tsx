import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Must contain at least one letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: ({ name, email, password }: Pick<FormData, 'name' | 'email' | 'password'>) =>
      authService.register({ name, email, password }),
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
      navigate('/dashboard', { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Start managing tasks with your team</p>
        </div>

        <form
          onSubmit={handleSubmit(({ name, email, password }) =>
            mutation.mutate({ name, email, password })
          )}
          className="space-y-4"
        >
          {[
            { id: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Doe', autoComplete: 'name' },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
            { id: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
            { id: 'confirmPassword', label: 'Confirm password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
          ].map(({ id, label, type, placeholder, autoComplete }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                {...register(id as keyof FormData)}
                type={type}
                autoComplete={autoComplete}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors[id as keyof FormData] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors[id as keyof FormData]?.message}
                </p>
              )}
            </div>
          ))}

          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700">
                {(mutation.error as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ?? 'Registration failed. Please try again.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
