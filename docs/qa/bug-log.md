# Bug Log — TaskFlow

```
Role:   QA Agent
Updated: 2026-05-06
```

---

## Cách đọc bảng

- **Status:** `Open` → `Fixed` → `Verified` → `Closed`
- **Severity:** 🔴 Critical | 🟠 High | 🟡 Medium | ⚪ Low

---

## Sprint 05 — User Admin + Task Dates + Notifications Foundation

| ID | Severity | AC | Description | File | Status |
|----|----------|----|-------------|------|--------|
| BUG-S05-01 | 🔴 Critical | US-027 AC1, AC5 | `startDate`/`endDate` validated với `z.string().datetime()` nhưng FE gửi `YYYY-MM-DD` từ `<input type="date">` → API trả 400 VALIDATION_ERROR khi user đặt ngày | `routes/tasks.ts:19-20,31-32` | ✅ Closed |

---

## Sprint 04 — Kanban Board

| ID | Severity | AC | Description | File | Status |
|----|----------|----|-------------|------|--------|
| BUG-01 | 🔴 Critical | US-016 AC2, AC4 | Assignee filter xóa hết task — so sánh `t.assigneeId` (undefined) thay vì `t.assignee?.id` | `KanbanBoard.tsx:60` | ✅ Closed |
| BUG-02 | 🟠 High | US-014 AC2 | Status bị ignore khi tạo task — `createSchema` và `createTask` không nhận `status` field | `routes/tasks.ts:11`, `services/taskService.ts:60` | ✅ Closed |
| BUG-03 | 🟡 Medium | — | Story Points error message "Expected number, received string" — `z.coerce` không handle empty string đúng | `TaskFormModal.tsx:14` | ✅ Closed |
| BUG-04 | 🟡 Medium | — | Error message Story Points hiển thị sai vị trí (bottom of grid row trông như dưới Assignee) | `TaskFormModal.tsx:116` | ✅ Closed |
| BUG-05 | ⚪ Low | — | Dead code branch `isDragging` không bao giờ chạy trong TaskCard | `TaskCard.tsx:23` | ✅ Closed |
| BUG-06 | 🔴 Critical | — | Refresh trang bị văng về login — `partialize` không persist `accessToken` và `isAuthenticated` | `authStore.ts:34` | ✅ Closed |

---

## Sprint 03 — Task Management

| ID | Severity | AC | Description | File | Status |
|----|----------|----|-------------|------|--------|
| BUG-S03-01 | 🟡 Medium | — | `updateProject` test sai — `expect.anything()` thừa vì mutation wrapper không forward RQ context | `DashboardPage.test.tsx` | ✅ Closed |

---

## Tổng kết theo Sprint

| Sprint | Total | Critical | High | Medium | Low | Closed |
|--------|-------|----------|------|--------|-----|--------|
| 03 | 1 | 0 | 0 | 1 | 0 | 1 |
| 04 | 6 | 2 | 1 | 2 | 1 | 6 |
| 05 | 1 | 1 | 0 | 0 | 0 | 1 |
