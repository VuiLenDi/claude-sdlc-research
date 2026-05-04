# Sprint 04 Review — Kanban Board

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-04
Sprint: 04 of 06
Status: Complete
```

---

## Sprint Goal — Đạt được

> "The ProjectPage becomes a real Kanban board with 4 status columns, drag-and-drop task movement, and assignee/priority filters — making work state visible at a glance."

✅ **Goal achieved.**

---

## Demo Highlights

### US-014 — Kanban Columns by Status
- ProjectPage hiển thị 4 cột: **To Do / In Progress / Review / Done**
- Column header có label + task count badge
- Empty column hiện "No tasks" placeholder
- Task card hiển thị: title, priority badge (color-coded), assignee name, story points

### US-015 — Drag Tasks Between Columns
- Task card draggable bằng `@dnd-kit/core`
- Thả vào column mới → status update **ngay lập tức** (optimistic update)
- API `PUT /api/projects/:id/tasks/:taskId` gọi sau drop
- Nếu API fail → task **tự động revert** về cột cũ
- Drop vào cùng cột → no-op (không gọi API)

### US-016 — Filter Board by Assignee / Priority
- Assignee dropdown lọc đúng theo `assignee.id`
- Priority multi-select: chọn nhiều priority cùng lúc (AND logic)
- "Clear filters" reset về trạng thái ban đầu
- Filters không persist qua page reload (đúng spec)

---

## Acceptance Criteria — Kết quả

| Story | AC | Result |
|-------|-----|--------|
| US-014 | AC1: 4 columns render | ✅ |
| US-014 | AC2: tasks in correct column | ✅ |
| US-014 | AC3: column header = label + count | ✅ |
| US-014 | AC4: card shows title, priority, assignee, points | ✅ |
| US-014 | AC5: empty column shows placeholder | ✅ |
| US-015 | AC1: task card is draggable | ✅ |
| US-015 | AC2: drop → PUT API with new status | ✅ |
| US-015 | AC3: optimistic move on drop | ✅ |
| US-015 | AC4: revert on API error | ✅ |
| US-016 | AC1: filter bar with assignee dropdown + priority buttons | ✅ |
| US-016 | AC2: assignee filter hides non-matching tasks | ✅ |
| US-016 | AC3: priority filter hides non-matching tasks | ✅ |
| US-016 | AC4: combined AND filter | ✅ |
| US-016 | AC5: Clear button resets all filters | ✅ |

**14/14 AC passed.**

---

## Metrics

| Metric | Result | Gate |
|--------|--------|------|
| FE Unit Tests | 54/54 pass | ✅ |
| FE Coverage (Statements) | 98.81% | ≥80% ✅ |
| FE Coverage (Branches) | 88.69% | ≥80% ✅ |
| BE Integration Tests | 62/62 pass | ✅ |
| BE Coverage (Statements) | 97.76% | ≥80% ✅ |
| QA Bugs Found | 6 | — |
| QA Bugs Closed | 6/6 | ✅ |

---

## QA Round (new this sprint)

Lần đầu áp dụng QA gate bắt buộc trước PR. QA Agent phát hiện 6 bugs:

| ID | Severity | Description |
|----|----------|-------------|
| BUG-01 | 🔴 Critical | Assignee filter broken — wrong field `t.assigneeId` vs `t.assignee?.id` |
| BUG-02 | 🟠 High | `createTask` silently dropped `status` field |
| BUG-03 | 🟡 Medium | Story Points Zod validation error message not user-friendly |
| BUG-04 | 🟡 Medium | Error message misaligned in form grid |
| BUG-05 | ⚪ Low | Dead code in TaskCard |
| BUG-06 | 🔴 Critical | Refresh logged user out — incomplete Zustand `partialize` |

Tất cả 6 bugs đã được fix và verified trước khi tạo PR.

---

## Deliverables

- `src/frontend/src/components/KanbanBoard.tsx` — new
- `src/frontend/src/components/TaskCard.tsx` — new
- `src/frontend/src/components/FilterBar.tsx` — new
- `src/frontend/src/pages/ProjectPage.tsx` — refactored (list → Kanban)
- `src/backend/src/routes/tasks.ts` — `status` field added to createSchema
- `src/backend/src/services/taskService.ts` — `status` field added to createTask
- `src/frontend/src/store/authStore.ts` — persist fix
- `docs/qa/` — QA process, bug log, common-bugs-checklist (new)

---

## Không đưa vào Sprint này

- Không có BE changes planned (drag reuses existing PUT endpoint) ✅
- Sprint 05 bắt đầu: User Admin + Task Dates + Notification Foundation
