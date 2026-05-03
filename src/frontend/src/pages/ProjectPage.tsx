import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../components/AppLayout';
import TaskFormModal from '../components/TaskFormModal';
import DeleteTaskDialog from '../components/DeleteTaskDialog';
import { taskService, type TaskPayload } from '../services/taskService';
import type { Task } from '../types';

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<Task['status'], string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export default function ProjectPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskService.getTasks(projectId!),
    enabled: !!projectId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => taskService.getMembers(projectId!),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: TaskPayload) => taskService.createTask(projectId!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      setCreateOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<TaskPayload>) =>
      taskService.updateTask(projectId!, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      setEditTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(projectId!, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      setDeleteTask(null);
    },
  });

  const handleCreate = (data: TaskPayload) => {
    createMutation.mutate({
      ...data,
      assigneeId: data.assigneeId || undefined,
    });
  };

  const handleEdit = (data: TaskPayload) => {
    editMutation.mutate({
      id: editTask!.id,
      ...data,
      assigneeId: data.assigneeId || null,
    });
  };

  const createError =
    (createMutation.error as { response?: { data?: { message?: string } } } | null)
      ?.response?.data?.message ?? null;

  const editError =
    (editMutation.error as { response?: { data?: { message?: string } } } | null)
      ?.response?.data?.message ?? null;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <nav className="text-sm text-gray-500 mb-1">
            <Link to="/dashboard" className="hover:text-indigo-600">Projects</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700">Tasks</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          + New Task
        </button>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Loading tasks…</p>}
      {isError && <p className="text-red-600 text-sm">Failed to load tasks. Please refresh.</p>}

      {!isLoading && !isError && tasks.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-4">No tasks yet — create your first one</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            + New Task
          </button>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-400">{STATUS_LABELS[task.status]}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-4 text-xs text-gray-400">
                <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
                {task.storyPoints && <span>{task.storyPoints} pts</span>}
              </div>

              <div className="shrink-0 flex items-center gap-1">
                <button
                  aria-label="Edit task"
                  onClick={() => setEditTask(task)}
                  className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                >
                  ✏️
                </button>
                <button
                  aria-label="Delete task"
                  onClick={() => setDeleteTask(task)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        error={createError}
        members={members}
      />

      <TaskFormModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        onSubmit={handleEdit}
        isPending={editMutation.isPending}
        error={editError}
        task={editTask ?? undefined}
        members={members}
      />

      <DeleteTaskDialog
        open={!!deleteTask}
        taskTitle={deleteTask?.title ?? ''}
        onConfirm={() => deleteMutation.mutate(deleteTask!.id)}
        onCancel={() => setDeleteTask(null)}
        isPending={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
