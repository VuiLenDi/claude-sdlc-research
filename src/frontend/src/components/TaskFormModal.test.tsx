import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskFormModal from './TaskFormModal';
import type { Task } from '../types';

const MEMBERS = [
  { id: 'u1', name: 'Alice', email: 'alice@x.com' },
];

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  projectId: 'proj-1',
  title: 'Test Task',
  description: '',
  status: 'todo',
  priority: 'medium',
  reporter: { id: 'u1', name: 'Alice', email: 'alice@x.com', createdAt: '' },
  assignee: undefined,
  reporterId: 'u1',
  position: 0,
  storyPoints: undefined,
  dueDate: undefined,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

describe('TaskFormModal — date pickers', () => {
  it('renders Start Date and End Date inputs', () => {
    render(
      <TaskFormModal open onClose={vi.fn()} onSubmit={vi.fn()} isPending={false} members={MEMBERS} />
    );
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('pre-fills date pickers when editing a task with dates', () => {
    const task = makeTask({
      startDate: '2026-05-10T00:00:00.000Z',
      endDate: '2026-05-20T00:00:00.000Z',
    });
    render(
      <TaskFormModal open onClose={vi.fn()} onSubmit={vi.fn()} isPending={false} members={MEMBERS} task={task} />
    );
    expect((screen.getByLabelText(/start date/i) as HTMLInputElement).value).toBe('2026-05-10');
    expect((screen.getByLabelText(/end date/i) as HTMLInputElement).value).toBe('2026-05-20');
  });

  it('date inputs are empty by default (new task)', () => {
    render(
      <TaskFormModal open onClose={vi.fn()} onSubmit={vi.fn()} isPending={false} members={MEMBERS} />
    );
    expect((screen.getByLabelText(/start date/i) as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText(/end date/i) as HTMLInputElement).value).toBe('');
  });
});
