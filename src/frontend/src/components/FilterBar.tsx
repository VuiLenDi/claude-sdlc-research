import type { MemberOption } from '../services/taskService';
import type { Task } from '../types';

export interface Filters {
  assigneeId: string;
  priorities: Task['priority'][];
}

interface Props {
  members: MemberOption[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

const PRIORITIES: Task['priority'][] = ['critical', 'high', 'medium', 'low'];

export default function FilterBar({ members, filters, onChange }: Props) {
  const hasActive = filters.assigneeId !== '' || filters.priorities.length > 0;

  const togglePriority = (p: Task['priority']) => {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter((x) => x !== p)
      : [...filters.priorities, p];
    onChange({ ...filters, priorities: next });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap mb-6">
      <select
        aria-label="Filter by assignee"
        value={filters.assigneeId}
        onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All assignees</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        {PRIORITIES.map((p) => (
          <button
            key={p}
            onClick={() => togglePriority(p)}
            aria-pressed={filters.priorities.includes(p)}
            className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${
              filters.priorities.includes(p)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {hasActive && (
        <button
          onClick={() => onChange({ assigneeId: '', priorities: [] })}
          className="text-xs text-gray-400 hover:text-gray-700 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
