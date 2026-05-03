# Common Bugs Checklist — QA

```
Role:   QA Agent
Updated: 2026-05-04
```

QA phải kiểm tra toàn bộ list này trước mỗi PR. Đánh dấu ✅ khi đã verify, ❌ khi phát hiện bug.

---

## 1. Auth & Session

- [ ] **Zustand `partialize`** — persist đủ `user`, `accessToken`, `isAuthenticated`. Thiếu field nào → refresh bị văng login *(BUG-06, Sprint 04)*
- [ ] **ProtectedRoute** — check đúng field `isAuthenticated`, không phải `user !== null`
- [ ] **Token expiry** — API trả 401 → app redirect về login, không crash

---

## 2. API Response Shape vs Frontend Type

- [ ] **Nested object vs flat field** — ví dụ: API trả `assignee: { id, name }` nhưng frontend dùng `t.assigneeId` (undefined) *(BUG-01, Sprint 04)*
- [ ] **Nullable fields** — `null` từ DB vs `undefined` trong TypeScript. Đảm bảo optional chaining hoặc `?? undefined`
- [ ] **Missing fields trong `format*` function** — kiểm tra BE formatter có trả đủ fields mà FE type khai báo không
- [ ] **Date fields** — BE trả `Date` object hay string ISO? FE expect string

---

## 3. Form Validation (Zod + RHF)

- [ ] **Error message vị trí** — error phải hiển thị ngay dưới input của nó, không phải dưới column khác. Dùng `items-start` cho grid *(BUG-04, Sprint 04)*
- [ ] **Error message nội dung** — không được để raw Zod message như "Expected number, received string" ra UI *(BUG-03, Sprint 04)*
- [ ] **Empty string vs undefined** — `type="number"` trả `''` khi empty. Dùng `z.preprocess` để convert về `undefined` trước khi validate
- [ ] **`defaultValues` type** — phải match Zod schema type. `''` ≠ `undefined` ≠ `null` *(BUG-03)*
- [ ] **Coerce vs transform** — `z.coerce.number()` với `''` cho `0`, không phải `undefined`

---

## 4. Backend Schema vs Service

- [ ] **Field trong route schema nhưng không truyền xuống service** — ví dụ `status` có trong `createSchema` nhưng `createTask()` không nhận → bị drop *(BUG-02, Sprint 04)*
- [ ] **Nullable update** — `PATCH/PUT` với `field: null` phải xóa giá trị, không phải ignore
- [ ] **Prisma default vs explicit** — field có `default` trong schema không có nghĩa là luôn đúng; kiểm tra khi user muốn override

---

## 5. Filter / Sort Logic

- [ ] **Undefined comparison** — `t.field !== value` khi `t.field` là `undefined` → luôn true → filter xóa hết *(BUG-01, Sprint 04)*
- [ ] **Empty filter state** — khi không filter gì, tất cả items phải hiện (không bị filter hidden)
- [ ] **Combined filters (AND)** — chọn assignee + priority → phải thỏa cả 2 điều kiện
- [ ] **Clear filters** — reset về trạng thái ban đầu, tất cả items hiện lại

---

## 6. Optimistic Update

- [ ] **`onMutate` snapshot** — phải `cancelQueries` trước khi `setQueryData` để tránh race condition
- [ ] **`onError` rollback** — phải restore `ctx.previous` khi API fail
- [ ] **`onSettled` invalidate** — luôn invalidate sau mutate (success hoặc error) để sync với server

---

## 7. Drag & Drop (dnd-kit)

- [ ] **Same column drop** — drop vào column cùng status → no-op (không gọi API)
- [ ] **Button click vs drag** — buttons bên trong draggable phải có `onPointerDown: e.stopPropagation()` để tránh kích hoạt drag khi click edit/delete
- [ ] **`over` null check** — `onDragEnd` phải check `if (!over) return` trước khi xử lý

---

## 8. State Persistence

- [ ] **Page refresh** — sau refresh, auth state và user data phải giữ nguyên
- [ ] **Filter state** — filter không persist qua reload (nếu spec nói vậy — US-016 AC: "Filter state does not persist across page reload" ✅)
- [ ] **Form reset** — modal mở lại phải reset về giá trị mặc định hoặc giá trị task đang edit

---

## Cách dùng checklist này

Trước mỗi PR, QA Agent chạy qua từng mục:
1. Kiểm tra bằng `curl` hoặc đọc source code
2. Đánh dấu ✅ (pass) hoặc ❌ (bug found)
3. Bug mới → ghi vào `bug-log.md` với ID tiếp theo
4. Nếu phát hiện pattern mới → thêm vào checklist này
