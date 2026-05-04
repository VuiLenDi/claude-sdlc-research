# Sprint 04 Retrospective — Kanban Board

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-04
Sprint: 04 of 06
```

---

## What Went Well ✅

**1. Kanban feature hoàn thành đúng spec**
Cả 3 user stories (US-014, US-015, US-016) delivered với 14/14 AC passed. Drag-and-drop với optimistic update hoạt động mượt mà.

**2. QA process mới phát huy hiệu quả ngay lần đầu**
Lần đầu áp dụng QA gate bắt buộc trước PR. Phát hiện 6 bugs — trong đó 2 critical sẽ làm hỏng feature nếu không được bắt:
- Assignee filter xóa hết task (BUG-01)
- Refresh bị văng login (BUG-06)

Đây là minh chứng rõ ràng cho giá trị của quy trình QA.

**3. Coverage cao ổn định**
FE 98.81% | BE 97.76% — duy trì được qua các sprint.

**4. Dnd-kit không cần install thêm**
Packages `@dnd-kit/core` và `@dnd-kit/sortable` đã có sẵn từ sprint planning → tiết kiệm setup time.

---

## What Didn't Go Well ❌

**1. Bug API response shape vs FE type mismatch (BUG-01)**
Backend `formatTask()` không trả `assigneeId` nhưng FE `Task` type khai báo field đó. Dẫn đến filter dùng `t.assigneeId` (undefined) thay vì `t.assignee?.id`. Đây là lỗi thiếu contract verification giữa BE và FE.

**2. createTask bỏ sót status field (BUG-02)**
Field `status` có trong `updateSchema` nhưng thiếu trong `createSchema` và service function. Lỗi "schema không đồng bộ" này cần được kiểm tra khi thêm field mới.

**3. Zustand partialize thiếu field (BUG-06)**
`persist({ partialize: (s) => ({ user: s.user }) })` — không persist `accessToken` và `isAuthenticated`. Đây là lỗi tinh tế dễ bị bỏ qua.

---

## Root Causes

| Nhóm lỗi | Pattern | Frequency |
|-----------|---------|-----------|
| API shape mismatch | BE formatter ≠ FE type | Sprint 03, 04 |
| Schema bỏ sót field | Route schema ≠ Service interface | Sprint 04 |
| State persistence | Zustand partialize thiếu | Sprint 04 |
| Form validation | Zod error message raw | Sprint 04 |

---

## Action Items cho Sprint 05

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| A1 | Mỗi khi FE dùng `t.someField`, kiểm tra `formatTask`/API response có field đó không | QA Checklist | High |
| A2 | Khi thêm field mới vào BE: cập nhật cả createSchema + updateSchema + service interface + formatTask | BE Agent | High |
| A3 | Mỗi khi thêm state mới vào Zustand store có `persist`: kiểm tra `partialize` | QA Checklist | Medium |
| A4 | Luôn dùng `z.preprocess` hoặc custom message cho Zod number/coerce | FE Agent | Medium |

→ **A1, A2, A3 đã được thêm vào `docs/qa/common-bugs-checklist.md`**

---

## Team Velocity

| Sprint | Points Committed | Points Delivered | Velocity |
|--------|-----------------|-----------------|---------|
| 01 | 21 | 21 | 100% |
| 02 | 21 | 21 | 100% |
| 03 | 21 | 21 | 100% |
| 04 | 21 | 21 | 100% |

---

## Sprint 05 Preview

**Theme:** User Admin + Task Dates + Notification Foundation  
**Stories:** US-025 (admin create users), US-026 (admin list/deactivate), US-027 (task start/end date), US-028 (notification lead time config), US-029 (start-date notification cron)  
**Points:** 21
