import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from './ProfilePage';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

vi.mock('../services/authService');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

const seedUser = () =>
  useAuthStore.setState({
    user: { id: '1', email: 'test@example.com', name: 'Test User', createdAt: '' },
    accessToken: 'token',
    isAuthenticated: true,
  });

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedUser();
  });

  it('renders user email and name fields', () => {
    render(<ProfilePage />, { wrapper });
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toHaveValue('Test User');
  });

  it('renders dashboard back link', () => {
    render(<ProfilePage />, { wrapper });
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
  });

  it('shows validation error when name is too short', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />, { wrapper });
    const nameInput = screen.getByPlaceholderText('Your name');
    await user.clear(nameInput);
    await user.type(nameInput, 'A');
    await user.click(screen.getByRole('button', { name: /save name/i }));
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it('calls updateProfile with new name on save', async () => {
    vi.mocked(authService.updateProfile).mockResolvedValue({
      id: '1', email: 'test@example.com', name: 'New Name', createdAt: '',
    });
    const user = userEvent.setup();
    render(<ProfilePage />, { wrapper });
    const nameInput = screen.getByPlaceholderText('Your name');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');
    await user.click(screen.getByRole('button', { name: /save name/i }));
    await waitFor(() =>
      expect(authService.updateProfile).toHaveBeenCalledWith({ name: 'New Name' })
    );
    expect(await screen.findByText(/name updated/i)).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<ProfilePage />, { wrapper });
    await user.type(screen.getByPlaceholderText('Current password'), 'OldPass1');
    await user.type(screen.getByPlaceholderText('New password'), 'NewPass1');
    await user.type(screen.getByPlaceholderText('Confirm new password'), 'Different1');
    await user.click(screen.getByRole('button', { name: /change password/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('calls updateProfile with password fields on valid submit', async () => {
    vi.mocked(authService.updateProfile).mockResolvedValue({
      id: '1', email: 'test@example.com', name: 'Test User', createdAt: '',
    });
    const user = userEvent.setup();
    render(<ProfilePage />, { wrapper });
    await user.type(screen.getByPlaceholderText('Current password'), 'OldPass1');
    await user.type(screen.getByPlaceholderText('New password'), 'NewPass2');
    await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass2');
    await user.click(screen.getByRole('button', { name: /change password/i }));
    await waitFor(() =>
      expect(authService.updateProfile).toHaveBeenCalledWith({
        currentPassword: 'OldPass1',
        password: 'NewPass2',
      })
    );
  });

  it('shows "Current password is incorrect" when API returns WRONG_PASSWORD', async () => {
    vi.mocked(authService.updateProfile).mockRejectedValue({
      response: { data: { message: 'Wrong password', code: 'WRONG_PASSWORD' } },
    });
    const user = userEvent.setup();
    render(<ProfilePage />, { wrapper });
    await user.type(screen.getByPlaceholderText('Current password'), 'Bad1');
    await user.type(screen.getByPlaceholderText('New password'), 'NewPass2');
    await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass2');
    await user.click(screen.getByRole('button', { name: /change password/i }));
    expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument();
  });
});
