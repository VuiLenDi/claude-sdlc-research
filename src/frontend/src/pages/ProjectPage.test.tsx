import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectPage from './ProjectPage';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { Task } from '../types';
import type { MemberOption } from '../services/taskService';

vi.mock('../services/taskService');
vi.mock('../services/authService');

const makeQC = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

const PROJECT_ID = 'proj-1';

const wrapper =
  (qc: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/projects/${PROJECT_ID}`]}>
        <Routes>
          <Route path="/projects/:id" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

const seedUser = () =>
  useAuthStore.setState({
    user: { id: 'user-1', email: 'owner@example.com', name: 'Owner', createdAt: '' },
    accessToken: 'token',
    isAuthenticated: true,
  });

const MEMBERS: MemberOption[] = [
  { id: 'user-1', name: 'Owner', email: 'owner@example.com' },
  { id: 'user-2', name: 'Alice', email: 'alice@example.com' },
];

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  projectId: PROJECT_ID,
  title: 'Fix bug',
  description: 'Needs attention',
  status: 'todo',
  priority: 'medium',
  reporter: { id: 'user-1', name: 'Owner', email: 'owner@example.com', createdAt: '' },
  assignee: undefined,
  position: 0,
  storyPoints: undefined,
  dueDate: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('ProjectPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedUser();
    vi.mocked(taskService.getMembers).mockResolvedValue(MEMBERS);
  });

  it('shows loading state initially', () => {
    vi.mocked(taskService.getTasks).mockReturnValue(new Promise(() => {}));
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows empty state when no tasks', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('renders task cards with title, priority, status', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([makeTask()]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText('Fix bug')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('shows assignee name when task is assigned', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([
      makeTask({ assignee: { id: 'user-2', name: 'Alice', email: 'alice@example.com', createdAt: '' } }),
    ]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText('Alice')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    vi.mocked(taskService.getTasks).mockRejectedValue(new Error('Network error'));
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  });

  it('opens create modal on "+ New Task" click', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText(/no tasks yet/i);
    await user.click(screen.getAllByRole('button', { name: /new task/i })[0]);
    expect(screen.getByRole('heading', { name: /new task/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/what needs to be done/i)).toBeInTheDocument();
  });

  it('calls createTask on form submit and closes modal', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([]);
    vi.mocked(taskService.createTask).mockResolvedValue(makeTask({ title: 'New Task' }));

    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText(/no tasks yet/i);
    await user.click(screen.getAllByRole('button', { name: /new task/i })[0]);
    await user.type(screen.getByPlaceholderText(/what needs to be done/i), 'New Task');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() =>
      expect(taskService.createTask).toHaveBeenCalledWith(
        PROJECT_ID,
        expect.objectContaining({ title: 'New Task' })
      )
    );
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/what needs to be done/i)).not.toBeInTheDocument()
    );
  });

  it('calls updateTask on edit form submit and closes modal', async () => {
    const user = userEvent.setup();
    const task = makeTask();
    vi.mocked(taskService.getTasks).mockResolvedValue([task]);
    vi.mocked(taskService.updateTask).mockResolvedValue({ ...task, title: 'Updated' });

    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Fix bug');
    await user.click(screen.getByLabelText(/edit task/i));
    const nameInput = screen.getByPlaceholderText(/what needs to be done/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() =>
      expect(taskService.updateTask).toHaveBeenCalledWith(
        PROJECT_ID,
        'task-1',
        expect.objectContaining({ title: 'Updated' })
      )
    );
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
    );
  });

  it('calls deleteTask on confirm and closes dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([makeTask()]);
    vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);

    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Fix bug');
    await user.click(screen.getByLabelText(/delete task/i));
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() =>
      expect(taskService.deleteTask).toHaveBeenCalledWith(PROJECT_ID, 'task-1')
    );
  });

  it('renders assignee dropdown with members in create modal', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText(/no tasks yet/i);
    await user.click(screen.getAllByRole('button', { name: /new task/i })[0]);
    expect(screen.getByRole('option', { name: 'Unassigned' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Owner' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Alice' })).toBeInTheDocument();
  });
});
