import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../services/adminService';
import type { User } from '../types';

const createUserSchema = z.object({
  name: z.string().min(2, 'Min 2 chars').max(100),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Min 8 chars')
    .regex(/[a-zA-Z]/, 'Must contain a letter')
    .regex(/[0-9]/, 'Must contain a number'),
  isAdmin: z.boolean().optional(),
});
type CreateUserForm = z.infer<typeof createUserSchema>;

export default function AdminPage() {
  const qc = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [leadTime, setLeadTime] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminService.getUsers,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const s = await adminService.getSettings();
      const lead = s.find((x) => x.key === 'notification_lead_days');
      if (lead) setLeadTime(lead.value);
      return s;
    },
  });

  const createMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowCreateForm(false);
      reset();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminService.deactivateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const settingsMutation = useMutation({
    mutationFn: (value: string) => adminService.updateSetting('notification_lead_days', value),
    onSuccess: () => {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { isAdmin: false },
  });

  const onCreateUser = (data: CreateUserForm) => createMutation.mutate(data);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      {/* ── Settings ── */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Notification Settings</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead time before task end date (days)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => settingsMutation.mutate(leadTime)}
            disabled={settingsMutation.isPending || !leadTime}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {settingsSaved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </section>

      {/* ── Users ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">User Management</h2>
          <button
            onClick={() => setShowCreateForm((v) => !v)}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            {showCreateForm ? 'Cancel' : '+ Create User'}
          </button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={handleSubmit(onCreateUser)}
            className="bg-white border border-gray-200 rounded-xl p-6 mb-4 space-y-3 max-w-lg"
          >
            <h3 className="text-sm font-semibold text-gray-700">New User</h3>
            <div>
              <input
                {...register('name')}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <input
                {...register('email')}
                placeholder="Email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register('password')}
                type="password"
                placeholder="Password (min 8 chars, 1 letter, 1 number)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input {...register('isAdmin')} type="checkbox" className="rounded" />
              Grant admin privileges
            </label>
            {createMutation.isError && (
              <p className="text-sm text-red-600">
                {(createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create user'}
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); reset(); }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {usersLoading ? (
            <p className="p-4 text-sm text-gray-400">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No users found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u: User) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">Admin</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Member</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Disabled</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.isActive && (
                        <button
                          aria-label={`Deactivate ${u.name}`}
                          onClick={() => deactivateMutation.mutate(u.id)}
                          disabled={deactivateMutation.isPending}
                          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Silence unused `settings` lint warning */}
      {settings.length === 0 && null}
    </div>
  );
}
