import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';
import { adminService } from '../services/adminService';

vi.mock('../services/adminService');

const makeQC = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const wrapper =
  (qc: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

const MOCK_USERS = [
  { id: 'u1', name: 'Alice', email: 'alice@example.com', isAdmin: true, isActive: true, createdAt: '' },
  { id: 'u2', name: 'Bob', email: 'bob@example.com', isAdmin: false, isActive: true, createdAt: '' },
  { id: 'u3', name: 'Carol', email: 'carol@example.com', isAdmin: false, isActive: false, createdAt: '' },
];

const MOCK_SETTINGS = [{ id: 's1', key: 'notification_lead_days', value: '2' }];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(adminService.getUsers).mockResolvedValue(MOCK_USERS);
  vi.mocked(adminService.getSettings).mockResolvedValue(MOCK_SETTINGS);
});

describe('AdminPage', () => {
  it('renders heading and sections', async () => {
    render(<AdminPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
  });

  it('lists all users with name, email, role and status', async () => {
    render(<AdminPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.getAllByText('Active')).toHaveLength(2);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows "Create User" button and opens form on click', async () => {
    const user = userEvent.setup();
    render(<AdminPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Alice');
    await user.click(screen.getByRole('button', { name: /create user/i }));
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
  });

  it('calls createUser on form submit', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.createUser).mockResolvedValue({
      id: 'new', name: 'New User', email: 'new@example.com', isAdmin: false, isActive: true, createdAt: '',
    });
    render(<AdminPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Alice');

    await user.click(screen.getByRole('button', { name: /create user/i }));
    await user.type(screen.getByPlaceholderText(/full name/i), 'New User');
    await user.type(screen.getByPlaceholderText(/email address/i), 'new@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /^create user$/i }));

    await waitFor(() =>
      expect(adminService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New User', email: 'new@example.com' }),
        expect.anything()
      )
    );
  });

  it('shows deactivate button only for active users', async () => {
    render(<AdminPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Alice');
    const deactivateButtons = screen.getAllByRole('button', { name: /deactivate/i });
    // Alice and Bob are active, Carol is not
    expect(deactivateButtons).toHaveLength(2);
  });

  it('calls deactivateUser when deactivate clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.deactivateUser).mockResolvedValue({
      ...MOCK_USERS[1], isActive: false,
    });
    render(<AdminPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Bob');

    await user.click(screen.getByRole('button', { name: /deactivate bob/i }));
    await waitFor(() => expect(adminService.deactivateUser).toHaveBeenCalledWith('u2'));
  });

  it('populates lead time from settings and calls updateSetting on save', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.updateSetting).mockResolvedValue({ id: 's1', key: 'notification_lead_days', value: '5' });
    render(<AdminPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Alice');

    const input = screen.getByDisplayValue('2');
    await user.clear(input);
    await user.type(input, '5');
    await user.click(screen.getByRole('button', { name: /save settings/i }));

    await waitFor(() =>
      expect(adminService.updateSetting).toHaveBeenCalledWith('notification_lead_days', '5')
    );
  });
});
