import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

const nameSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type NameForm = z.infer<typeof nameSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const nameMutation = useMutation({
    mutationFn: (data: NameForm) => authService.updateProfile({ name: data.name }),
    onSuccess: (updated) => {
      updateUser({ name: updated.name });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      authService.updateProfile({
        currentPassword: data.currentPassword,
        password: data.password,
      }),
    onSuccess: () => {
      passwordForm.reset();
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    },
  });

  const nameError = nameMutation.error as { response?: { data?: { message?: string } } } | null;
  const pwError = passwordMutation.error as { response?: { data?: { message?: string; code?: string } } } | null;
  const pwErrorMsg =
    pwError?.response?.data?.code === 'WRONG_PASSWORD'
      ? 'Current password is incorrect'
      : pwError?.response?.data?.message ?? (passwordMutation.isError ? 'Update failed' : null);

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      <p className="text-sm text-gray-500 mb-8">{user?.email}</p>

      {/* Name section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Display Name</h2>
        <form
          onSubmit={nameForm.handleSubmit((d) => nameMutation.mutate(d))}
          className="space-y-4"
        >
          <div>
            <input
              {...nameForm.register('name')}
              placeholder="Your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {nameForm.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{nameForm.formState.errors.name.message}</p>
            )}
            {nameError && (
              <p className="mt-1 text-sm text-red-600">
                {nameError.response?.data?.message ?? 'Update failed'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={nameMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {nameMutation.isPending ? 'Saving…' : 'Save name'}
            </button>
            {nameSuccess && <span className="text-sm text-green-600">Name updated!</span>}
          </div>
        </form>
      </section>

      {/* Password section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
        <form
          onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))}
          className="space-y-4"
        >
          <div>
            <input
              {...passwordForm.register('currentPassword')}
              type="password"
              placeholder="Current password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>
          <div>
            <input
              {...passwordForm.register('password')}
              type="password"
              placeholder="New password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {passwordForm.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div>
            <input
              {...passwordForm.register('confirmPassword')}
              type="password"
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          {pwErrorMsg && <p className="text-sm text-red-600">{pwErrorMsg}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {passwordMutation.isPending ? 'Saving…' : 'Change password'}
            </button>
            {pwSuccess && <span className="text-sm text-green-600">Password changed!</span>}
          </div>
        </form>
      </section>
    </div>
  );
}
