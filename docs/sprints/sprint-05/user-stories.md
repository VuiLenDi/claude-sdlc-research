# Sprint 05 User Stories — User Admin + Task Dates + Notifications Foundation

```
Role:   Orchestrator (Claude — BA function)
Date:   2026-05-04
Sprint: 05
Status: Approved
```

---

## US-025: Admin Create User Accounts

**As a** system admin,
**I want to** create user accounts,
**So that** I can onboard team members without self-registration.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | `isAdmin` flag added to User model via Prisma migration | BE int |
| AC2 | Admin-only endpoint: `POST /api/admin/users` (name, email, password) | BE int |
| AC3 | Admin middleware returns 403 for non-admin callers | BE int |
| AC4 | Admin panel page lists all users with "Create User" button | FE unit |
| AC5 | Created users can log in with provided credentials immediately | BE int |

---

## US-026: Admin List & Deactivate Users

**As a** system admin,
**I want to** list all users and deactivate accounts,
**So that** I can manage access control.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | `GET /api/admin/users` returns all users (id, name, email, isActive, createdAt) | BE int |
| AC2 | `PATCH /api/admin/users/:id/deactivate` sets `isActive = false` | BE int |
| AC3 | Deactivated user cannot login (401 with `ACCOUNT_DISABLED` code) | BE int |
| AC4 | Admin panel shows user list with deactivate button per user | FE unit |

---

## US-027: Task Start & End Dates

**As a** team member,
**I want to** set start date and end date on a task,
**So that** the team knows the schedule.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | TaskFormModal adds start date (optional) and end date (optional) date pickers | FE unit |
| AC2 | Both dates stored in DB via additive Prisma migration (no breaking change) | BE int |
| AC3 | Task cards show date range when at least one date is set | FE unit |
| AC4 | End date shown in red when past current date (overdue) | FE unit |
| AC5 | `PUT /api/projects/:id/tasks/:taskId` accepts `startDate` and `endDate` fields | BE int |

---

## US-028: Admin Configure Notification Lead Time

**As a** system admin,
**I want to** configure notification lead time before task end date,
**So that** users get reminders at the right time.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | `AdminSetting` model: key-value table with seed value `notification_lead_days = 2` | BE int |
| AC2 | `GET /api/admin/settings` returns current settings | BE int |
| AC3 | `PUT /api/admin/settings` updates a setting value | BE int |
| AC4 | Admin panel shows settings form with lead time input (1–30 days) | FE unit |

---

## US-029: System Creates Start-Date Notifications

**As the** system,
**I want to** create notifications when a task's start date arrives,
**So that** assignees are alerted automatically.

### Acceptance Criteria

| # | Criteria | Test |
|---|---------|------|
| AC1 | `Notification` model created (id, userId, taskId, type, message, isRead, createdAt) | BE int |
| AC2 | `node-cron` job runs daily at 08:00 UTC | BE unit (mock cron) |
| AC3 | Job finds tasks where `startDate = today` and `assigneeId` is set | BE unit |
| AC4 | Creates one `Notification` per task/assignee (deduped by taskId + type + date) | BE int |
