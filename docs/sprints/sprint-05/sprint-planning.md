# Sprint 05 Planning — User Admin + Task Dates + Notifications Foundation

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-04
Sprint: 05 of 06
Status: Active
```

---

## Sprint Goal
> **"Admins can manage user accounts and configure notifications; team members can set task schedules with start/end dates; the system automatically notifies assignees when their tasks begin."**

---

## Sprint Timeline

| Day | Hours | Activities |
|-----|-------|-----------|
| Day 1 (2026-05-04) | 0–8h | BE: Prisma migration + admin routes + auth update + task dates |
| Day 2 (2026-05-05) | 8–16h | BE: notification cron + tests; FE: AdminPage + task date UI + tests; QA |

---

## Committed Stories

| ID | Story | Assignee | Points | Status |
|----|-------|---------|--------|--------|
| US-025 | Admin create user accounts | BE + FE Agent | 5 | To Do |
| US-026 | Admin list & deactivate users | BE + FE Agent | 3 | To Do |
| US-027 | Task start & end dates | BE + FE Agent | 8 | To Do |
| US-028 | Admin configure notification lead time | BE + FE Agent | 3 | To Do |
| US-029 | System creates start-date notifications | BE Agent | 5 | To Do |
| **Total** | | | **24** | |

---

## Task Breakdown

### BE Agent Tasks
| Task | Story | Est. Hours |
|------|-------|-----------|
| BE-T01: Prisma migration — User (isAdmin, isActive), Task (startDate, endDate), AdminSetting, Notification models | All | 1h |
| BE-T02: Admin middleware (requireAdmin) + update JWT to carry isAdmin | US-025 | 0.5h |
| BE-T03: Admin users routes — POST + GET /api/admin/users, PATCH /:id/deactivate | US-025, US-026 | 1.5h |
| BE-T04: Update auth login — check isActive, 401 ACCOUNT_DISABLED | US-026 | 0.5h |
| BE-T05: Admin settings routes — GET + PUT /api/admin/settings | US-028 | 0.5h |
| BE-T06: Task routes — accept startDate + endDate on PUT | US-027 | 0.5h |
| BE-T07: Notification cron job (node-cron, daily 08:00 UTC) | US-029 | 1.5h |
| BE-T08: BE integration + unit tests | All | 2h |

### FE Agent Tasks
| Task | Story | Est. Hours |
|------|-------|-----------|
| FE-T30: Update types (User.isAdmin/isActive, Task.startDate/endDate, Notification) | All | 0.5h |
| FE-T31: AdminPage — user list + create user form + deactivate toggle + settings form | US-025, US-026, US-028 | 2.5h |
| FE-T32: TaskFormModal — add start date + end date pickers | US-027 | 1h |
| FE-T33: TaskCard — show date range, highlight overdue end date | US-027 | 0.5h |
| FE-T34: App.tsx — add /admin route (admin guard) | US-025 | 0.5h |
| FE-T35: FE unit tests | All | 1.5h |

---

## Tech Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| isAdmin in JWT | Yes — include in token payload | Avoids DB query per request; re-login needed after role change (acceptable for admin flow) |
| Admin middleware | `requireAdmin` after `authenticate` | Composable, reuses existing auth |
| Date input | `<input type="date">` | No extra library; native browser support |
| Cron library | `node-cron` | Already planned; lightweight, no extra infra |
| Notification dedup | Unique constraint (taskId + type + date) | Prevents duplicate notifications per day |
| isAdmin seed | First registered user gets isAdmin via SQL seed or manual | Bootstrapping problem; document in README |

---

## Definition of Done
- [ ] Prisma migration runs cleanly on existing data
- [ ] Admin can create, list, deactivate users via API
- [ ] Deactivated user cannot login
- [ ] Tasks accept startDate + endDate; cards show them
- [ ] Overdue end date shown in red
- [ ] Cron job creates Notification records (deduped)
- [ ] Admin settings (lead time) persisted in DB
- [ ] FE + BE tests ≥ 80% coverage, all pass
- [ ] QA round complete, all bugs Closed
- [ ] Branch `feature/sprint-05` → PR to `sprint-05`
