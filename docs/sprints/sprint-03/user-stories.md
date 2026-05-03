# Sprint 03 User Stories — Task Management

```
Role:   Orchestrator (Claude — BA function)
Date:   2026-05-03
Sprint: 03
Status: Approved
```

---

## US-009: Create a Task

**As a** team member,
**I want to** create a task within a project,
**So that** work is tracked and visible to the team.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | Task form has: title (required), description, priority, story points, due date | FE unit |
| AC2 | Title max 255 chars, min 1 char | FE + BE validation |
| AC3 | New task defaults to `todo` status; reporter auto-set to caller | BE integration |
| AC4 | Task appears in project task list immediately after creation (query invalidation) | FE unit |
| AC5 | Priority dropdown: `low`, `medium`, `high`, `critical` — defaults to `medium` | FE unit |

---

## US-010: Update a Task

**As a** team member,
**I want to** edit a task's details,
**So that** the task information stays current as work progresses.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | Edit button opens modal pre-filled with current task data | FE unit |
| AC2 | Can update: title, description, priority, status, story points, due date | BE integration |
| AC3 | Status dropdown: `todo`, `in_progress`, `review`, `done` | FE unit |
| AC4 | Modal closes and task list refreshes on successful save | FE unit |
| AC5 | Any project member can edit tasks | BE integration |

---

## US-011: Delete a Task

**As a** team member,
**I want to** delete a task,
**So that** the backlog stays clean and irrelevant tasks are removed.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | Delete button visible in task row/card | FE unit |
| AC2 | Confirmation dialog shown before deletion | FE unit |
| AC3 | Task removed from list immediately after confirmed delete | FE unit |
| AC4 | Any project member can delete tasks | BE integration |
| AC5 | Returns 404 if task not found or not in specified project | BE integration |

---

## US-012: Assign a Task

**As a** team member,
**I want to** assign a task to myself or another project member,
**So that** ownership and responsibility are clear.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | Assignee dropdown shows all project members by name | FE unit |
| AC2 | "Unassigned" is a valid option (null assignee) | FE unit + BE integration |
| AC3 | GET /api/projects/:id/members returns member list with id, name, email | BE integration |
| AC4 | Assigned member name (or "Unassigned") shown on task card | FE unit |
| AC5 | Assignee can be changed via the edit task modal | FE unit |
