# Sprint 04 User Stories — Kanban Board

```
Role:   Orchestrator (Claude — BA function)
Date:   2026-05-03
Sprint: 04
Status: Approved
```

---

## US-014: Kanban Columns by Status

**As a** team member,
**I want to** see tasks organized in columns by status,
**So that** I can understand the workflow state at a glance.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | ProjectPage shows 4 columns: To Do, In Progress, Review, Done | FE unit |
| AC2 | Each task appears in the column matching its status | FE unit |
| AC3 | Column header shows status label + task count | FE unit |
| AC4 | Task card shows: title, priority badge (color coded), assignee, story points | FE unit |
| AC5 | Empty column shows "No tasks" placeholder | FE unit |

---

## US-015: Drag Tasks Between Columns

**As a** team member,
**I want to** drag a task from one column to another,
**So that** I can update its status without opening the edit modal.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | Task card is draggable | FE unit (mock dnd) |
| AC2 | Dropping into a column triggers PUT with new status (optimistic update) | FE unit |
| AC3 | Task moves to new column immediately on drop | FE unit |
| AC4 | If API call fails, task reverts to original column | FE unit |

---

## US-016: Filter Board by Assignee / Priority

**As a** team member,
**I want to** filter the board to show only relevant tasks,
**So that** I can focus on my work or specific priorities.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | Filter bar above board with assignee dropdown and priority checkboxes | FE unit |
| AC2 | Selecting an assignee hides tasks not assigned to them | FE unit |
| AC3 | Selecting priorities hides tasks not matching | FE unit |
| AC4 | Filters combine: assignee AND priority | FE unit |
| AC5 | "Clear" button resets all filters | FE unit |
