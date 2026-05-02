import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './LoginPage';
import { authService } from '../services/authService';

vi.mock('../services/authService');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
);

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email and password fields', () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('shows validation errors for empty submit', async () => {
    render(<LoginPage />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('calls authService.login with correct credentials', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      user: { id: '1', email: 'test@example.com', name: 'Test', createdAt: '' },
      accessToken: 'token123',
    });

    render(<LoginPage />, { wrapper });
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      // React Query v5 passes mutation context as 2nd arg — check only the payload
      expect(authService.login).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password' },
        expect.anything()
      );
    });
  });

  it('shows error message on login failure', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Unauthorized'));

    render(<LoginPage />, { wrapper });
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'wrong@example.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
