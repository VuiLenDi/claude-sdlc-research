import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: 0.6 }
    : isDragging ? { opacity: 0.6 } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 select-none"
      {...attributes}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
            {task.priority}
          </span>
          {task.storyPoints != null && (
            <span className="text-xs text-gray-400">{task.storyPoints}p</span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 my-1">{task.title}</p>
        <p className="text-xs text-gray-400">{task.assignee?.name ?? 'Unassigned'}</p>
      </div>
      <div className="flex items-center justify-end gap-1 mt-2">
        <button
          aria-label="Edit task"
          onClick={() => onEdit(task)}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 text-gray-400 hover:text-indigo-600 rounded"
        >
          ✏️
        </button>
        <button
          aria-label="Delete task"
          onClick={() => onDelete(task)}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1 text-gray-400 hover:text-red-600 rounded"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
