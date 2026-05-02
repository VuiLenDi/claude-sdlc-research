import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from './DashboardPage';
import { projectService } from '../services/projectService';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { Project } from '../types';

vi.mock('../services/projectService');
vi.mock('../services/authService');

const makeQC = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const wrapper =
  (qc: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );

const OWNER_ID = 'user-1';

const seedUser = () =>
  useAuthStore.setState({
    user: { id: OWNER_ID, email: 'owner@example.com', name: 'Owner', createdAt: '' },
    accessToken: 'token',
    isAuthenticated: true,
  });

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  name: 'Alpha',
  description: 'First project',
  ownerId: OWNER_ID,
  memberCount: 1,
  taskCount: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedUser();
  });

  it('shows loading state initially', () => {
    vi.mocked(projectService.getProjects).mockReturnValue(new Promise(() => {}));
    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows empty state when no projects', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue([]);
    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText(/no projects yet/i)).toBeInTheDocument();
  });

  it('renders project cards with name, task count, member count', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue([makeProject()]);
    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
    expect(screen.getByText('1 member')).toBeInTheDocument();
  });

  it('shows edit and delete buttons only for owned projects', async () => {
    const ownedProject = makeProject({ ownerId: OWNER_ID });
    const otherProject = makeProject({ id: 'proj-2', name: 'Beta', ownerId: 'other-user' });
    vi.mocked(projectService.getProjects).mockResolvedValue([ownedProject, otherProject]);
    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Alpha');
    const editBtns = screen.getAllByLabelText(/edit project/i);
    const deleteBtns = screen.getAllByLabelText(/delete project/i);
    expect(editBtns).toHaveLength(1);
    expect(deleteBtns).toHaveLength(1);
  });

  it('opens create modal on "+ New Project" click', async () => {
    const user = userEvent.setup();
    vi.mocked(projectService.getProjects).mockResolvedValue([]);
    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText(/no projects yet/i);
    await user.click(screen.getAllByRole('button', { name: /new project/i })[0]);
    expect(screen.getByRole('heading', { name: /new project/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/my awesome project/i)).toBeInTheDocument();
  });

  it('calls createProject on form submit and closes modal', async () => {
    const user = userEvent.setup();
    vi.mocked(projectService.getProjects).mockResolvedValue([]);
    vi.mocked(projectService.createProject).mockResolvedValue(makeProject({ name: 'New Proj' }));

    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText(/no projects yet/i);
    await user.click(screen.getAllByRole('button', { name: /new project/i })[0]);
    await user.type(screen.getByPlaceholderText(/my awesome project/i), 'New Proj');
    await user.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() =>
      expect(projectService.createProject).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Proj' }),
        expect.anything()
      )
    );
    // onSuccess closes modal
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/my awesome project/i)).not.toBeInTheDocument()
    );
  });

  it('calls updateProject on edit form submit', async () => {
    const user = userEvent.setup();
    const project = makeProject();
    vi.mocked(projectService.getProjects).mockResolvedValue([project]);
    vi.mocked(projectService.updateProject).mockResolvedValue({ ...project, name: 'Updated' });

    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Alpha');
    await user.click(screen.getByLabelText(/edit project/i));
    const nameInput = screen.getByPlaceholderText(/my awesome project/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(projectService.updateProject).toHaveBeenCalledWith(
        'proj-1',
        expect.objectContaining({ name: 'Updated' })
      )
    );
    // onSuccess closes edit modal
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
    );
  });

  it('calls deleteProject on confirm', async () => {
    const user = userEvent.setup();
    vi.mocked(projectService.getProjects).mockResolvedValue([makeProject()]);
    vi.mocked(projectService.deleteProject).mockResolvedValue(undefined);

    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Alpha');
    await user.click(screen.getByLabelText(/delete project/i));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() =>
      expect(projectService.deleteProject).toHaveBeenCalledWith(
        'proj-1',
        expect.anything() // React Query v5 passes context as 2nd arg
      )
    );
  });

  it('shows error state when fetch fails', async () => {
    vi.mocked(projectService.getProjects).mockRejectedValue(new Error('Network error'));
    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  });

  it('renders logout button in navbar', async () => {
    vi.mocked(projectService.getProjects).mockResolvedValue([]);
    vi.mocked(authService.logout).mockResolvedValue(undefined);
    render(<DashboardPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByRole('button', { name: /logout/i })).toBeInTheDocument();
  });
});
