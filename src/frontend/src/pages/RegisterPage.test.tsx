import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPage from './RegisterPage';
import { authService } from '../services/authService';

vi.mock('../services/authService');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

// userEvent v14 setup() pattern — required for proper event sequencing
const setup = () => userEvent.setup();

const renderAndFill = async (overrides: Record<string, string> = {}) => {
  const user = setup();
  render(<RegisterPage />, { wrapper });

  const vals = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
    ...overrides,
  };

  await user.type(screen.getByPlaceholderText('Jane Doe'), vals.name);
  await user.type(screen.getByPlaceholderText('you@example.com'), vals.email);
  const pwdInputs = screen.getAllByPlaceholderText('••••••••');
  await user.type(pwdInputs[0], vals.password);
  await user.type(pwdInputs[1], vals.confirmPassword);
  return user;
};

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all four fields and submit button', () => {
    render(<RegisterPage />, { wrapper });
    expect(screen.getByPlaceholderText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation error when name is too short on empty submit', async () => {
    const user = setup();
    render(<RegisterPage />, { wrapper });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    const user = await renderAndFill({ confirmPassword: 'DifferentPass1' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows validation error for weak password (no number)', async () => {
    const user = await renderAndFill({ password: 'OnlyLetters', confirmPassword: 'OnlyLetters' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/at least one number/i)).toBeInTheDocument();
  });

  it('shows validation error for password too short', async () => {
    const user = await renderAndFill({ password: 'Ab1', confirmPassword: 'Ab1' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('shows validation error for missing letter in password', async () => {
    const user = await renderAndFill({ password: '12345678', confirmPassword: '12345678' });
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/at least one letter/i)).toBeInTheDocument();
  });

  it('calls authService.register with correct payload on valid submit', async () => {
    vi.mocked(authService.register).mockResolvedValue({
      user: { id: '1', email: 'jane@example.com', name: 'Jane Doe', createdAt: '' },
      accessToken: 'token123',
    });

    const user = await renderAndFill();
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // RegisterPage wraps register call: authService.register({ name, email, password })
    // so only 1 argument is passed (no React Query context unlike LoginPage)
    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password1',
      });
    });
  });

  it('shows API error message on registration failure', async () => {
    vi.mocked(authService.register).mockRejectedValue({
      response: { data: { message: 'Email already registered' } },
    });

    const user = await renderAndFill();
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
  });

  it('shows generic fallback error when no response message', async () => {
    vi.mocked(authService.register).mockRejectedValue(new Error('Network error'));

    const user = await renderAndFill();
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument();
  });

  it('has a link to the login page', () => {
    render(<RegisterPage />, { wrapper });
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });
});
