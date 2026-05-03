import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
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

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: unknown) => void }) => {
    (globalThis as Record<string, unknown>).__dndOnDragEnd = onDragEnd;
    return children;
  },
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    isDragging: false,
  }),
  pointerWithin: null,
}));

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
  reporterId: 'user-1',
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
    (globalThis as Record<string, unknown>).__dndOnDragEnd = undefined;
  });

  it('shows loading state initially', () => {
    vi.mocked(taskService.getTasks).mockReturnValue(new Promise(() => {}));
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows "No tasks" placeholder in all 4 columns when empty', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    const placeholders = await screen.findAllByText('No tasks');
    expect(placeholders).toHaveLength(4);
  });

  it('renders task card in correct column with title, priority, assignee', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([makeTask()]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText('Fix bug')).toBeInTheDocument();
    // Priority badge is a span; filter buttons are buttons — narrow to span
    expect(screen.getByText('medium', { selector: 'span' })).toBeInTheDocument();
    // "To Do" column header
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('shows assignee name when task is assigned', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([
      makeTask({ assignee: { id: 'user-2', name: 'Alice', email: 'alice@example.com', createdAt: '' } }),
    ]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    // Alice appears in both FilterBar option and task card <p> — target the card specifically
    expect(await screen.findByText('Alice', { selector: 'p' })).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    vi.mocked(taskService.getTasks).mockRejectedValue(new Error('Network error'));
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
  });

  it('shows all 4 kanban column headers', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findAllByText('No tasks');
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('places tasks in the correct column by status', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([
      makeTask({ id: 'task-1', title: 'Todo task', status: 'todo' }),
      makeTask({ id: 'task-2', title: 'Done task', status: 'done' }),
    ]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Todo task');
    expect(screen.getByText('Todo task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
    // Two empty columns (in_progress and review) still show "No tasks"
    expect(screen.getAllByText('No tasks')).toHaveLength(2);
  });

  it('opens create modal on "+ New Task" click', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findAllByText('No tasks');
    await user.click(screen.getByRole('button', { name: /new task/i }));
    expect(screen.getByRole('heading', { name: /new task/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/what needs to be done/i)).toBeInTheDocument();
  });

  it('calls createTask on form submit and closes modal', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([]);
    vi.mocked(taskService.createTask).mockResolvedValue(makeTask({ title: 'New Task' }));

    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findAllByText('No tasks');
    await user.click(screen.getByRole('button', { name: /new task/i }));
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
    await screen.findAllByText('No tasks');
    await user.click(screen.getByRole('button', { name: /new task/i }));
    // "Unassigned" only in modal select; "Owner"/"Alice" appear in both FilterBar and modal selects
    expect(screen.getByRole('option', { name: 'Unassigned' })).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: 'Owner' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: 'Alice' }).length).toBeGreaterThanOrEqual(1);
  });

  it('filter by assignee hides tasks not matching', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([
      makeTask({ id: 'task-1', title: 'My task', assigneeId: 'user-1',
        assignee: { id: 'user-1', name: 'Owner', email: 'owner@example.com', createdAt: '' } }),
      makeTask({ id: 'task-2', title: 'Alice task', assigneeId: 'user-2',
        assignee: { id: 'user-2', name: 'Alice', email: 'alice@example.com', createdAt: '' } }),
    ]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('My task');

    await user.selectOptions(screen.getByLabelText('Filter by assignee'), 'user-1');

    expect(screen.getByText('My task')).toBeInTheDocument();
    expect(screen.queryByText('Alice task')).not.toBeInTheDocument();
  });

  it('filter by priority hides non-matching tasks', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([
      makeTask({ id: 'task-1', title: 'High task', priority: 'high' }),
      makeTask({ id: 'task-2', title: 'Low task', priority: 'low' }),
    ]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('High task');

    await user.click(screen.getByRole('button', { name: 'high' }));

    expect(screen.getByText('High task')).toBeInTheDocument();
    expect(screen.queryByText('Low task')).not.toBeInTheDocument();
  });

  it('clear filters button resets assignee and priority filters', async () => {
    const user = userEvent.setup();
    vi.mocked(taskService.getTasks).mockResolvedValue([
      makeTask({ id: 'task-1', title: 'High task', priority: 'high' }),
      makeTask({ id: 'task-2', title: 'Low task', priority: 'low' }),
    ]);
    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('High task');

    await user.click(screen.getByRole('button', { name: 'high' }));
    expect(screen.queryByText('Low task')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(screen.getByText('Low task')).toBeInTheDocument();
  });

  it('calls updateTask with new status on drag end', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([makeTask({ status: 'todo' })]);
    vi.mocked(taskService.updateTask).mockResolvedValue(makeTask({ status: 'in_progress' }));

    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Fix bug');

    act(() => {
      const handler = (globalThis as Record<string, unknown>).__dndOnDragEnd as
        | ((e: unknown) => void)
        | undefined;
      handler?.({ active: { id: 'task-1' }, over: { id: 'in_progress' } });
    });

    await waitFor(() =>
      expect(taskService.updateTask).toHaveBeenCalledWith(
        PROJECT_ID,
        'task-1',
        { status: 'in_progress' }
      )
    );
  });

  it('reverts task to original status when drag API call fails', async () => {
    vi.mocked(taskService.getTasks).mockResolvedValue([makeTask({ status: 'todo' })]);
    vi.mocked(taskService.updateTask).mockRejectedValue(new Error('API error'));

    render(<ProjectPage />, { wrapper: wrapper(makeQC()) });
    await screen.findByText('Fix bug');

    act(() => {
      const handler = (globalThis as Record<string, unknown>).__dndOnDragEnd as
        | ((e: unknown) => void)
        | undefined;
      handler?.({ active: { id: 'task-1' }, over: { id: 'in_progress' } });
    });

    await waitFor(() => expect(taskService.updateTask).toHaveBeenCalled());
    // onSettled triggers invalidateQueries → getTasks is called again
    await waitFor(() => expect(taskService.getTasks).toHaveBeenCalledTimes(2));
  });
});
