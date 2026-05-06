# Sprint 05 Review — User Admin + Task Dates + Notifications Foundation

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-06
Sprint: 05 of 06
Status: Approved
```

---

## Sprint Goal — Result

> **"Admins can manage user accounts and configure notifications; team members can set task schedules with start/end dates; the system automatically notifies assignees when their tasks begin."**

✅ **Goal ACHIEVED** — Tất cả 5 stories delivered, 1 QA bug tìm thấy và fix trong sprint.

---

## Stories Delivered

| ID | Story | Points | Status | Notes |
|----|-------|--------|--------|-------|
| US-025 | Admin create user accounts | 5 | ✅ Done | POST /api/admin/users + AdminPage |
| US-026 | Admin list & deactivate users | 3 | ✅ Done | GET + PATCH /deactivate; isActive check on login |
| US-027 | Task start & end dates | 8 | ✅ Done | Date pickers + card display + overdue highlight |
| US-028 | Admin configure notification lead time | 3 | ✅ Done | AdminSetting model + API + UI form |
| US-029 | System creates start-date notifications | 5 | ✅ Done | node-cron daily job + dedup via unique constraint |
| **Total** | | **24** | **5/5** | |

---

## Acceptance Criteria Coverage

| US | AC Total | AC Met |
|----|---------|--------|
| US-025 | 5 | 5/5 ✅ |
| US-026 | 4 | 4/4 ✅ |
| US-027 | 5 | 5/5 ✅ |
| US-028 | 4 | 4/4 ✅ |
| US-029 | 4 | 4/4 ✅ |

---

## QA Summary

| Bugs Found | Critical | High | Medium | Low | All Closed |
|-----------|----------|------|--------|-----|------------|
| 1 | 1 | 0 | 0 | 0 | ✅ Yes |

**BUG-S05-01** (Critical): `z.string().datetime()` thay vì `.date()` cho startDate/endDate → sẽ fail 100% khi user đặt ngày. Fixed trong sprint bởi BE Agent.

---

## Definition of Done — Checklist

- [x] Prisma migration runs cleanly on existing data
- [x] Admin can create, list, deactivate users via API
- [x] Deactivated user cannot login (401 ACCOUNT_DISABLED)
- [x] Tasks accept startDate + endDate; cards show them
- [x] Overdue end date shown in red
- [x] Cron job creates Notification records (deduped)
- [x] Admin settings (lead time) persisted in DB
- [x] FE + BE tests written (integration + unit)
- [x] QA round complete, all bugs Closed
- [x] Branch `feature/sprint-05` committed → PR to `sprint-05`

---

## Technical Highlights

- **`requireAdmin` middleware**: composable, reuses existing `authenticate` — không DB query per request
- **`z.string().date()`**: Zod 3.23 native date-only validation — không cần regex custom
- **Notification dedup**: unique constraint `(taskId, type, notifDate)` — catch ở DB layer, không cần app-level check
- **Cron job isolation**: `startCronJobs()` chỉ gọi khi `NODE_ENV !== 'test'` — test suite không bị side effects

---

## Velocity

| Sprint | Committed | Delivered | Bug Count |
|--------|-----------|-----------|-----------|
| 01 | 21 | 21 | — |
| 02 | 21 | 21 | — |
| 03 | 21 | 21 | 1 |
| 04 | 21 | 21 | 6 |
| 05 | 24 | 24 | 1 |
