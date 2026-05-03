# Sprint 03 Planning — Task Management

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-03
Sprint: 03 of 04
Status: Active
```

---

## Sprint Goal
> **"Users can create, view, edit, delete, and assign tasks within a project. The placeholder ProjectPage becomes a real task board. This unlocks the Kanban board and Sprint Management in Sprint 04."**

---

## Sprint Timeline

| Day | Hours | Activities |
|-----|-------|-----------|
| Day 1 (2026-05-03) | 0–8h | BE: Tasks CRUD API + tests; FE: ProjectPage + task list |
| Day 2 (2026-05-04) | 8–16h | FE: TaskFormModal + assignment; QA: full coverage pass |

---

## Committed Stories

| ID | Story | Assignee | Points | Status |
|----|-------|---------|--------|--------|
| US-009 | Create task | BE Agent + FE Agent | 8 | To Do |
| US-010 | Update task | BE Agent + FE Agent | 5 | To Do |
| US-011 | Delete task | BE Agent + FE Agent | 3 | To Do |
| US-012 | Assign task to member | BE Agent + FE Agent | 5 | To Do |
| **Total** | | | **21** | |

> Sprint capacity: 21 pts (calibrated from Sprint 02 velocity)

---

## Task Breakdown

### BE Agent Tasks (Day 1)
| Task | Story | Est. Hours |
|------|-------|-----------|
| BE-T14: GET /api/projects/:id/members | US-012 | 0.5h |
| BE-T15: POST /api/projects/:id/tasks | US-009 | 1h |
| BE-T16: GET /api/projects/:id/tasks | US-009 | 0.5h |
| BE-T17: GET /api/projects/:id/tasks/:taskId | US-010 | 0.5h |
| BE-T18: PUT /api/projects/:id/tasks/:taskId | US-010 | 1h |
| BE-T19: DELETE /api/projects/:id/tasks/:taskId | US-011 | 0.5h |
| BE-T20: Integration tests (tasks suite) | All | 2h |

### FE Agent Tasks (Day 1–2)
| Task | Story | Est. Hours |
|------|-------|-----------|
| FE-T17: ProjectPage (task list + empty state) | US-009 | 2h |
| FE-T18: TaskCard component | US-009 | 1h |
| FE-T19: TaskFormModal (create + edit, shared) | US-009/010 | 1.5h |
| FE-T20: DeleteTaskDialog | US-011 | 0.5h |
| FE-T21: Assignee dropdown (project members) | US-012 | 1h |
| FE-T22: taskService (API wrapper) | All | 0.5h |
| FE-T23: Priority + status badges | US-009 | 0.5h |

### QA Tasks (Day 2)
| Task | Story | Est. Hours |
|------|-------|-----------|
| QA-T08: Tasks API integration tests | US-009–012 | 1h |
| QA-T09: ProjectPage + TaskFormModal component tests | US-009–012 | 1h |
| QA-T10: Coverage gate verification ≥80% | All | 0.5h |

---

## API Design

### Tasks Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/projects/:id/members | ✅ member | List project members (for assignee dropdown) |
| POST | /api/projects/:id/tasks | ✅ member | Create task (reporter = caller) |
| GET | /api/projects/:id/tasks | ✅ member | List all tasks in project |
| GET | /api/projects/:id/tasks/:taskId | ✅ member | Get task detail |
| PUT | /api/projects/:id/tasks/:taskId | ✅ member | Update task |
| DELETE | /api/projects/:id/tasks/:taskId | ✅ member | Delete task |

### Task Response Shape
```json
{
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "...",
    "description": "...",
    "status": "todo | in_progress | review | done",
    "priority": "low | medium | high | critical",
    "assignee": { "id": "...", "name": "...", "email": "..." } | null,
    "reporter": { "id": "...", "name": "..." },
    "storyPoints": 3,
    "dueDate": "ISO string" | null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Definition of Done

- [ ] All AC for committed stories met
- [ ] `docker compose up` → ProjectPage shows task list, CRUD works
- [ ] BE integration tests ≥80% coverage, all pass
- [ ] FE component tests ≥80% coverage, all pass
- [ ] Each feature on its own branch → PR to `sprint-03`
- [ ] PO notified and approved before merge to master

---

## Risks

| Risk | Mitigation |
|------|-----------|
| TaskFormModal complexity (create vs edit modes) | Same pattern as ProjectFormModal — mode via `task` prop presence |
| Members endpoint reuse (already have project members in DB) | Simple query, no new migration needed |
| FE test coverage for dropdown component | Seed members in test, mock API, assert dropdown options render |
