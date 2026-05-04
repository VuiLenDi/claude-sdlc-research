# Sprint 04 Planning — Kanban Board

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-03
Sprint: 04 of 06
Status: Active
```

---

## Sprint Goal
> **"The ProjectPage becomes a real Kanban board with 4 status columns, drag-and-drop task movement, and assignee/priority filters — making work state visible at a glance."**

---

## Sprint Timeline

| Day | Hours | Activities |
|-----|-------|-----------|
| Day 1 (2026-05-03) | 0–8h | FE: Kanban column layout + task cards; install dnd library |
| Day 2 (2026-05-04) | 8–16h | FE: Drag-and-drop + filter bar + tests; QA: coverage pass |

> **Note**: No BE changes needed — status update reuses existing `PUT /api/projects/:id/tasks/:taskId`.

---

## Committed Stories

| ID | Story | Assignee | Points | Status |
|----|-------|---------|--------|--------|
| US-014 | Kanban columns by status | FE Agent | 8 | To Do |
| US-015 | Drag-and-drop between columns | FE Agent | 8 | To Do |
| US-016 | Filter by assignee + priority | FE Agent | 5 | To Do |
| **Total** | | | **21** | |

---

## Task Breakdown

### FE Agent Tasks
| Task | Story | Est. Hours |
|------|-------|-----------|
| FE-T24: Install @dnd-kit/core + @dnd-kit/sortable | US-015 | 0.5h |
| FE-T25: KanbanBoard component (4 columns) | US-014 | 2h |
| FE-T26: TaskCard component (used in columns) | US-014 | 1h |
| FE-T27: Drag-and-drop handlers + optimistic update | US-015 | 2h |
| FE-T28: FilterBar component (assignee + priority) | US-016 | 1h |
| FE-T29: Wire ProjectPage → KanbanBoard | All | 0.5h |

### QA Tasks
| Task | Story | Est. Hours |
|------|-------|-----------|
| QA-T11: KanbanBoard + FilterBar component tests | All | 1.5h |
| QA-T12: Coverage gate verification ≥80% | All | 0.5h |

---

## Tech Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| DnD library | `@dnd-kit/core` + `@dnd-kit/sortable` | Lightweight, accessible, works with React 18 + Vitest |
| Status update | Optimistic update via React Query | Immediate feedback; rollback on error |
| Column order | todo → in_progress → review → done | Standard Kanban flow |
| Filter state | Local useState (no URL params) | Simple enough for v1 |

---

## Definition of Done
- [ ] 4 columns render with correct tasks
- [ ] Drag task → column → status updates via API
- [ ] Filter by assignee and/or priority works
- [ ] FE tests ≥80% coverage, all pass
- [ ] `docker compose up` → Kanban board functional
- [ ] Branch `feature/kanban-board` → PR to `sprint-04`
