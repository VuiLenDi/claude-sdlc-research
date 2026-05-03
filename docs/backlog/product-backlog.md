# Product Backlog — TaskFlow

```
Role:   Orchestrator (Claude — BA + Scrum Master function)
Date:   Sprint 0 — Day 0 (2026-04-28) | Revised 2026-05-03
Sprint: Pre-Sprint (Backlog Grooming) + Sprint 04 Grooming
Status: Approved by PO
```

---

## Backlog Summary

| Epic | Stories | Story Points | Priority | Target Sprint |
|------|---------|-------------|----------|--------------|
| E01: Authentication | 4 | 21 | Critical | Sprint 01 ✅ |
| E02: Project Management | 4 | 20 | High | Sprint 01–02 ✅ |
| E03: Task Management | 6 | 37 | High | Sprint 02–05 (US-027 new) |
| E04: Kanban Board | 3 | 21 | Medium | Sprint 04 |
| E05: Sprint Management | 3 | 18 | Medium | Backlog |
| E06: Team Collaboration | 4 | 16 | Medium | Sprint 06 |
| E07: Dashboard & Metrics | 2 | 13 | Low | Backlog |
| E08: User Administration | 2 | 8 | High | Sprint 05 |
| E09: Notifications | 4 | 16 | High | Sprint 05–06 |
| **Total** | **32** | **170** | | **6 Sprints** |

---

## Epic E01: Authentication & User Management ✅ Done
> **Goal**: Users can securely register, login, and manage their identity

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-001 | As a new user, I want to register with email/password so I can access the app | 4 | 5 | Critical | 01 ✅ |
| US-002 | As a registered user, I want to login so I can access my workspace | 4 | 5 | Critical | 01 ✅ |
| US-003 | As a logged-in user, I want to logout so my session ends securely | 2 | 3 | Critical | 01 ✅ |
| US-004 | As a user, I want to view and update my profile so my info stays current | 3 | 8 | High | 02 ✅ |

---

## Epic E02: Project Management ✅ Done
> **Goal**: Users can create and manage projects as workspaces for tasks

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-005 | As a user, I want to create a project so I have a workspace for my tasks | 3 | 5 | High | 02 ✅ |
| US-006 | As a project owner, I want to edit project details so they stay accurate | 3 | 3 | High | 02 ✅ |
| US-007 | As a project owner, I want to delete a project so I can clean up old work | 2 | 5 | High | 02 ✅ |
| US-008 | As a user, I want to see all my projects on a dashboard so I can switch between them | 3 | 8 | High | 02 ✅ |

---

## Epic E03: Task Management
> **Goal**: Users can create, manage, and track individual tasks

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-009 | As a team member, I want to create a task so work is tracked | 5 | 8 | High | 03 ✅ |
| US-010 | As a team member, I want to update a task so its info stays current | 4 | 5 | High | 03 ✅ |
| US-011 | As a team member, I want to delete a task so the backlog stays clean | 2 | 3 | High | 03 ✅ |
| US-012 | As a team member, I want to assign a task to myself or others so ownership is clear | 3 | 5 | High | 03 ✅ |
| US-013 | As a team member, I want to set task priority so urgency is visible | 3 | 8 | High | 03 ✅ |
| US-027 | As a team member, I want to set start date and end date on a task so the team knows the schedule | 4 | 8 | High | 05 |

### US-027 Acceptance Criteria
- [ ] TaskFormModal adds: start date (optional) and end date (optional) date pickers
- [ ] Both dates stored in DB via Prisma migration (additive — does not break existing tasks)
- [ ] Task cards show date range when both dates are set
- [ ] End date overdue highlighted in red when past current date
- [ ] API: PUT /api/projects/:id/tasks/:taskId accepts startDate and endDate fields

---

## Epic E04: Kanban Board
> **Goal**: Visual board for tracking task status at a glance

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-014 | As a team member, I want to see tasks in columns by status so I understand workflow | 4 | 8 | Medium | 04 |
| US-015 | As a team member, I want to drag tasks between columns to update status | 3 | 8 | Medium | 04 |
| US-016 | As a team member, I want to filter the board by assignee/priority | 3 | 5 | Medium | 04 |

### US-014 Acceptance Criteria
- [ ] ProjectPage shows 4 columns: To Do / In Progress / Review / Done
- [ ] Each task card shows: title, priority badge, assignee name, story points
- [ ] Task count shown in each column header
- [ ] Empty column shows placeholder text

### US-015 Acceptance Criteria
- [ ] User can drag a task card from one column to another
- [ ] Status updates immediately on drop (optimistic update)
- [ ] API call PUT /api/projects/:id/tasks/:taskId with new status on drop
- [ ] Drag indicator visible while dragging

### US-016 Acceptance Criteria
- [ ] Filter bar above board: assignee dropdown + priority multi-select
- [ ] Filters apply immediately, task cards not matching are hidden
- [ ] "Clear filters" button resets to show all tasks
- [ ] Filter state does not persist across page reload

---

## Epic E05: Sprint Management
> **Goal**: Teams can run time-boxed sprints

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-017 | As a team lead, I want to create a sprint and set its goal | 3 | 5 | Medium | Backlog |
| US-018 | As a team lead, I want to add backlog tasks to a sprint | 2 | 5 | Medium | Backlog |
| US-019 | As a team lead, I want to complete a sprint and see a summary | 3 | 8 | Medium | Backlog |

---

## Epic E06: Team Collaboration
> **Goal**: Multiple users can work on the same project

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-020 | As a project owner, I want to add members to a project by email | 3 | 5 | Medium | 06 |
| US-021 | As a team member, I want to comment on tasks | 3 | 5 | Medium | 06 |
| US-022 | As a team member, I want to see who is working on what | 2 | 3 | Low | Backlog |

---

## Epic E07: Dashboard & Metrics
> **Goal**: Visibility into project progress without meetings

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-023 | As a manager, I want to see sprint velocity and burndown | 3 | 8 | Low | Backlog |
| US-024 | As a user, I want to see my personal task summary | 2 | 5 | Low | Backlog |

---

## Epic E08: User Administration *(new — 2026-05-03)*
> **Goal**: System admin can provision user accounts, reducing onboarding friction for teams

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-025 | As a system admin, I want to create user accounts so I can onboard team members without self-registration | 5 | 5 | High | 05 |
| US-026 | As a system admin, I want to list all users and deactivate accounts so I can manage access | 3 | 3 | High | 05 |

### US-025 Acceptance Criteria
- [ ] Admin-only endpoint: POST /api/admin/users (name, email, password)
- [ ] `isAdmin` flag added to User model via Prisma migration
- [ ] Admin middleware returns 403 for non-admin callers
- [ ] Admin panel page lists users with "Create User" button
- [ ] Created users can log in with provided credentials immediately

### US-026 Acceptance Criteria
- [ ] GET /api/admin/users returns all users (id, name, email, isActive, createdAt)
- [ ] PATCH /api/admin/users/:id/deactivate sets isActive = false
- [ ] Deactivated user cannot login (401 with ACCOUNT_DISABLED code)
- [ ] Admin panel shows user list with deactivate toggle

---

## Epic E09: Notifications *(new — 2026-05-03)*
> **Goal**: Users receive timely alerts for task schedules; admin controls reminder lead time

| ID | User Story | AC Count | Points | Priority | Sprint |
|----|-----------|---------|--------|----------|--------|
| US-028 | As a system admin, I want to configure notification lead time before task end date | 3 | 3 | High | 05 |
| US-029 | As the system, I want to create notifications when a task's start date arrives | 3 | 5 | High | 05 |
| US-030 | As the system, I want to create end-date reminder notifications based on admin lead time config | 3 | 5 | High | 06 |
| US-031 | As a user, I want to see a notification bell in the navbar showing unread alerts | 4 | 3 | High | 06 |

### US-028 Acceptance Criteria
- [ ] AdminSetting model: key-value table (`notification_lead_days`, default = 2)
- [ ] GET /api/admin/settings and PUT /api/admin/settings
- [ ] Admin panel shows settings form with lead time input (1–30 days)
- [ ] Setting persists across server restarts

### US-029 Acceptance Criteria
- [ ] node-cron job runs daily at 08:00 UTC
- [ ] Finds all tasks where `startDate = today` and `assigneeId` is set
- [ ] Creates one `Notification` record per matching task per assignee (deduped)
- [ ] Notification type: `start_date`, message: "Task '{title}' starts today"

### US-030 Acceptance Criteria
- [ ] Same cron job checks tasks where `endDate = today + lead_days`
- [ ] Creates `Notification` record type: `end_date_reminder`
- [ ] Message: "Task '{title}' is due in {lead_days} day(s)"
- [ ] Does not create duplicate if notification already exists for same task+type+day

### US-031 Acceptance Criteria
- [ ] Navbar shows bell icon with unread count badge
- [ ] GET /api/notifications returns latest 20 notifications for current user
- [ ] PATCH /api/notifications/:id/read marks as read
- [ ] FE polls every 60s via React Query refetchInterval
- [ ] Clicking notification item navigates to the related task's project

---

## Sprint Roadmap (updated)

| Sprint | Theme | Stories | Pts | Status |
|--------|-------|---------|-----|--------|
| 01 | Auth + Login/Register UI | US-001–003, US-004a/b | 21 | ✅ Done |
| 02 | Projects CRUD + Dashboard + Profile | US-004c, US-005–008 | 21 | ✅ Done |
| 03 | Task Management | US-009–013 (US-012 partial) | 21 | ✅ Done |
| 04 | Kanban Board | US-014–016 | 21 | 🔄 Active |
| 05 | User Admin + Task Dates + Notif Foundation | US-025–027, US-028–029 | 21 | Planned |
| 06 | Notification Delivery + Team Collab | US-030–031, US-020–021 | 21 | Planned |

---

## Backlog Health Log

| Date | Action | Notes |
|------|--------|-------|
| 2026-04-28 | Initial backlog created | Pre-sprint grooming session |
| 2026-05-03 | Revised after Sprint 03 completion | Added E08, E09; added US-027 to E03; extended to 6 sprints; PO approved |
