import { DndContext, useDroppable, pointerWithin, type DragEndEvent } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import type { Task } from '../types';
import type { Filters } from './FilterBar';

const COLUMNS: { id: Task['status']; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

interface ColumnProps {
  id: Task['status'];
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function KanbanColumn({ id, label, tasks, onEdit, onDelete }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[200px] bg-gray-50 rounded-xl p-3 transition-colors ${
        isOver ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-300' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[60px]">
        {tasks.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

interface Props {
  tasks: Task[];
  filters: Filters;
  onDragEnd: (taskId: string, newStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function KanbanBoard({ tasks, filters, onDragEnd, onEdit, onDelete }: Props) {
  const filtered = tasks.filter((t) => {
    if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(t.priority)) return false;
    return true;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as Task['status'];
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;
    onDragEnd(String(active.id), newStatus);
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ id, label }) => (
          <KanbanColumn
            key={id}
            id={id}
            label={label}
            tasks={filtered.filter((t) => t.status === id)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}
