import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskCard from './TaskCard';
import type { Task } from '../types';

vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
  }),
}));

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  projectId: 'proj-1',
  title: 'Test Task',
  description: '',
  status: 'todo',
  priority: 'medium',
  reporter: { id: 'u1', name: 'Owner', email: 'owner@x.com', createdAt: '' },
  assignee: undefined,
  reporterId: 'u1',
  position: 0,
  storyPoints: undefined,
  dueDate: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('TaskCard — date range', () => {
  it('does not show dates when neither startDate nor endDate is set', () => {
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText(/→/)).not.toBeInTheDocument();
  });

  it('shows date range when startDate and endDate are set', () => {
    const task = makeTask({
      startDate: '2026-05-01T00:00:00.000Z',
      endDate: '2026-05-31T00:00:00.000Z',
    });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it('shows date range with only endDate set', () => {
    const task = makeTask({ endDate: '2026-05-31T00:00:00.000Z' });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it('marks overdue end date in red', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const task = makeTask({ endDate: pastDate.toISOString() });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const dateEl = screen.getByText(/→/);
    expect(dateEl.className).toMatch(/red/);
  });

  it('does NOT mark future end date in red', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const task = makeTask({ endDate: futureDate.toISOString() });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const dateEl = screen.getByText(/→/);
    expect(dateEl.className).not.toMatch(/red/);
  });
});
