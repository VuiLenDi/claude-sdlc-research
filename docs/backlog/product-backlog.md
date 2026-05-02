# Product Backlog — TaskFlow

```
Role:   Orchestrator (Claude — BA + Scrum Master function)
Date:   Sprint 0 — Day 0 (2026-04-28)
Sprint: Pre-Sprint (Backlog Grooming)
Status: Approved by PO
```

---

## Backlog Summary

| Epic | Stories | Story Points | Priority | Target Sprint |
|------|---------|-------------|----------|--------------|
| E01: Authentication | 4 | 21 | Critical | Sprint 01 |
| E02: Project Management | 4 | 20 | High | Sprint 01–02 |
| E03: Task Management | 5 | 34 | High | Sprint 02 |
| E04: Kanban Board | 3 | 21 | Medium | Sprint 03 |
| E05: Sprint Management | 3 | 13 | Medium | Sprint 03 |
| E06: Team Collaboration | 3 | 13 | Medium | Sprint 04 |
| E07: Dashboard & Metrics | 2 | 13 | Low | Sprint 04 |
| **Total** | **24** | **135** | | **4 Sprints** |

---

## Epic E01: Authentication & User Management
> **Goal**: Users can securely register, login, and manage their identity

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-001 | As a new user, I want to register with email/password so I can access the app | 4 | 5 | Critical | 01 |
| US-002 | As a registered user, I want to login so I can access my workspace | 4 | 5 | Critical | 01 |
| US-003 | As a logged-in user, I want to logout so my session ends securely | 2 | 3 | Critical | 01 |
| US-004 | As a user, I want to view and update my profile so my info stays current | 3 | 8 | High | 01 |

### US-001 Acceptance Criteria
- [ ] Registration form has: email, password, confirm password, name fields
- [ ] Email must be unique — show error if already registered
- [ ] Password minimum 8 chars, must include letter + number
- [ ] On success: user is logged in and redirected to dashboard
- [ ] On failure: clear error messages shown inline

### US-002 Acceptance Criteria
- [ ] Login form has: email, password fields + "Remember me" checkbox
- [ ] On success: redirect to last visited page or dashboard
- [ ] On failure: generic error (don't reveal if email exists)
- [ ] JWT stored in memory; refresh token in httpOnly cookie
- [ ] "Forgot password" link visible (out of scope v1 but link exists)

### US-003 Acceptance Criteria
- [ ] Logout button visible in nav when authenticated
- [ ] On logout: clear all tokens, redirect to login
- [ ] Session expires after 15 min inactivity (access token TTL)

### US-004 Acceptance Criteria
- [ ] Profile page shows: name, email, avatar placeholder
- [ ] User can update name
- [ ] User can change password (requires current password confirmation)
- [ ] Changes saved with success toast notification

---

## Epic E02: Project Management
> **Goal**: Users can create and manage projects as workspaces for tasks

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-005 | As a user, I want to create a project so I have a workspace for my tasks | 3 | 5 | High | 01 |
| US-006 | As a project owner, I want to edit project details so they stay accurate | 3 | 3 | High | 01 |
| US-007 | As a project owner, I want to delete a project so I can clean up old work | 2 | 5 | High | 02 |
| US-008 | As a user, I want to see all my projects on a dashboard so I can switch between them | 3 | 8 | High | 02 |

### US-005 Acceptance Criteria
- [ ] Create project modal: name (required), description (optional)
- [ ] Project name max 100 chars, min 3 chars
- [ ] Creator automatically becomes project owner
- [ ] After creation: navigate to new project board

### US-006 Acceptance Criteria
- [ ] Edit button visible to project owner/admin
- [ ] Can update: name, description
- [ ] Changes reflected immediately without page reload

### US-007 Acceptance Criteria
- [ ] Delete requires confirmation dialog ("Type project name to confirm")
- [ ] All tasks and sprints deleted with project (cascade)
- [ ] Only project owner can delete

### US-008 Acceptance Criteria
- [ ] Dashboard shows project cards: name, task count, last activity
- [ ] Projects sorted by last activity by default
- [ ] "Create new project" button prominent on empty state

---

## Epic E03: Task Management
> **Goal**: Users can create, manage, and track individual tasks

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-009 | As a team member, I want to create a task so work is tracked | 5 | 8 | High | 02 |
| US-010 | As a team member, I want to update a task so its info stays current | 4 | 5 | High | 02 |
| US-011 | As a team member, I want to delete a task so the backlog stays clean | 2 | 3 | High | 02 |
| US-012 | As a team member, I want to assign a task to myself or others so ownership is clear | 3 | 8 | High | 02 |
| US-013 | As a team member, I want to set task priority and due date so urgency is visible | 3 | 8 | High | 02 |

### US-009 Acceptance Criteria
- [ ] Task form: title (required), description, priority, assignee, due date, story points
- [ ] Task title max 255 chars
- [ ] Task created in "To Do" status by default
- [ ] Task visible immediately on board after creation
- [ ] Reporter is auto-set to the creating user

### US-010 Acceptance Criteria
- [ ] Task detail modal/panel opens on click
- [ ] All fields editable inline
- [ ] Changes auto-saved with debounce (no save button needed)
- [ ] Edit history not required for v1

### US-011 Acceptance Criteria
- [ ] Delete available in task detail (not on board card)
- [ ] Requires single confirmation click
- [ ] Any project member can delete tasks

### US-012 Acceptance Criteria
- [ ] Assignee dropdown shows project members
- [ ] Unassigned is a valid state (shown as avatar placeholder)
- [ ] One assignee per task for v1

### US-013 Acceptance Criteria
- [ ] Priority: critical, high, medium, low (color coded)
- [ ] Due date: date picker, optional
- [ ] Overdue tasks highlighted in red
- [ ] Story points: integer 1–13

---

## Epic E04: Kanban Board
> **Goal**: Visual board for tracking task status at a glance

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-014 | As a team member, I want to see tasks in columns by status so I understand workflow | 3 | 8 | Medium | 03 |
| US-015 | As a team member, I want to drag tasks between columns to update status | 3 | 8 | Medium | 03 |
| US-016 | As a team member, I want to filter the board by assignee/priority | 2 | 5 | Medium | 03 |

---

## Epic E05: Sprint Management
> **Goal**: Teams can run time-boxed sprints

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-017 | As a team lead, I want to create a sprint and set its goal | 3 | 5 | Medium | 03 |
| US-018 | As a team lead, I want to add backlog tasks to a sprint | 2 | 5 | Medium | 03 |
| US-019 | As a team lead, I want to complete a sprint and see a summary | 3 | 8 | Medium | 03 |

---

## Epic E06: Team Collaboration
> **Goal**: Multiple users can work on the same project

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-020 | As a project owner, I want to invite members by email | 3 | 5 | Medium | 04 |
| US-021 | As a team member, I want to comment on tasks | 3 | 5 | Medium | 04 |
| US-022 | As a team member, I want to see who is working on what | 2 | 3 | Low | 04 |

---

## Epic E07: Dashboard & Metrics
> **Goal**: Visibility into project progress without meetings

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-023 | As a manager, I want to see sprint velocity and burndown | 3 | 8 | Low | 04 |
| US-024 | As a user, I want to see my personal task summary | 2 | 5 | Low | 04 |

---

## Backlog Health Log

| Date | Action | Notes |
|------|--------|-------|
| 2026-04-28 | Initial backlog created | Pre-sprint grooming session |
