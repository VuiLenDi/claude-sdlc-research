# Sprint 05 Retrospective

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-06
Sprint: 05 of 06
Status: Approved
```

---

## What Went Well ✅

- **Schema design clean**: Additive migration — không breaking change cho data cũ. `AdminSetting` key-value pattern đơn giản nhưng đủ dùng cho sprint-06 notification expansion.
- **Cron job + dedup pattern**: `try/catch` on unique constraint violation là idiom gọn — không cần pre-check query, race-condition safe.
- **QA catch rate**: 1 critical bug tìm thấy và fix trước khi merge — pattern `z.string().datetime()` vs `z.string().date()` là trap dễ xảy ra khi copy schema từ existing fields.
- **Test coverage**: Integration tests cho admin routes và notification service cover đủ happy path + edge cases (dedup, no-assignee, non-admin caller).

---

## What Could Be Better ⚠️

- **Date format contract không được document**: Bug BUG-S05-01 xảy ra vì FE và BE không có shared convention về date format. Nên có API contract doc hoặc Zod schema shared giữa FE/BE.
- **Admin bootstrap chưa có seed script**: `isAdmin` cho user đầu tiên vẫn là manual SQL. Sprint-06 nên thêm seed script hoặc env-based bootstrap.

---

## Action Items → Sprint 06

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| A1 | Thêm seed script để bootstrap admin user đầu tiên | BE Agent | Medium |
| A2 | Document date format convention: FE gửi `YYYY-MM-DD`, BE parse sang `Date` | Orchestrator | Low |

---

## Sprint 06 Preview

Sprint cuối — focus vào notification delivery cho user + team collaboration:
- **US-030**: End-date reminder notifications (cron + lead time from AdminSetting)
- **US-031**: Notification bell UI (navbar badge, unread count, mark-as-read)
- **US-020**: Add project members by email
- **US-021**: Task comments
