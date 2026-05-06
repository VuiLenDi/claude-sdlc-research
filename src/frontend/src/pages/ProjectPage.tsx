import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../components/AppLayout';
import TaskFormModal from '../components/TaskFormModal';
import DeleteTaskDialog from '../components/DeleteTaskDialog';
import FilterBar, { type Filters } from '../components/FilterBar';
import KanbanBoard from '../components/KanbanBoard';
import { taskService, type TaskPayload } from '../services/taskService';
import type { Task } from '../types';

export default function ProjectPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<Filters>({ assigneeId: '', priorities: [] });

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

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      taskService.updateTask(projectId!, taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] });
      const previous = qc.getQueryData<Task[]>(['tasks', projectId]);
      qc.setQueryData<Task[]>(['tasks', projectId], (old = []) =>
        old.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['tasks', projectId], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const toIso = (d?: string | null) => (d ? new Date(d).toISOString() : undefined);

  const handleCreate = (data: TaskPayload) => {
    createMutation.mutate({
      ...data,
      assigneeId: data.assigneeId || undefined,
      startDate: toIso(data.startDate),
      endDate: toIso(data.endDate),
    });
  };

  const handleEdit = (data: TaskPayload) => {
    editMutation.mutate({
      id: editTask!.id,
      ...data,
      assigneeId: data.assigneeId || null,
      startDate: data.startDate ? toIso(data.startDate) : null,
      endDate: data.endDate ? toIso(data.endDate) : null,
    });
  };

  const handleDragEnd = (taskId: string, newStatus: Task['status']) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  const createError =
    (createMutation.error as { response?: { data?: { message?: string } } } | null)
      ?.response?.data?.message ?? null;

  const editError =
    (editMutation.error as { response?: { data?: { message?: string } } } | null)
      ?.response?.data?.message ?? null;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
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

      <FilterBar members={members} filters={filters} onChange={setFilters} />

      {isLoading && <p className="text-gray-500 text-sm">Loading tasks…</p>}
      {isError && <p className="text-red-600 text-sm">Failed to load tasks. Please refresh.</p>}

      {!isLoading && !isError && (
        <KanbanBoard
          tasks={tasks}
          filters={filters}
          onDragEnd={handleDragEnd}
          onEdit={setEditTask}
          onDelete={setDeleteTask}
        />
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
