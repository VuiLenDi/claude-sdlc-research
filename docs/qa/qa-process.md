# QA Process — TaskFlow

```
Role:   QA Agent + Orchestrator
Status: Approved by PO (2026-05-04)
Applies from: Sprint 05 onwards
```

---

## Quy trình bắt buộc trước khi tạo PR

```
Code done → QA Test Round → Bug Log Updated → Dev Fix → QA Verify → PR created
```

### Bước 1 — QA Test Round

QA Agent thực hiện kiểm tra toàn diện:

1. **API layer** — dùng `curl` test từng endpoint:
   - Happy path (201/200)
   - Validation errors (400 với đúng error code)
   - Auth missing/invalid (401)
   - Not found (404)
   - Unauthorized user (403/404)

2. **Frontend logic** — đọc source code kiểm tra:
   - Form validation (schema Zod, default values, error message vị trí)
   - API response shape vs TypeScript type (field nào thiếu?)
   - Filter/sort logic (edge case: empty, undefined, null)
   - State persistence (Zustand `partialize` — lưu đủ fields?)
   - Optimistic update + rollback logic
   - Missing AC (đối chiếu từng AC trong user-stories.md)

3. **Common bugs checklist** — xem `docs/qa/common-bugs-checklist.md`

### Bước 2 — Ghi bug vào Bug Log

File: `docs/qa/bug-log.md`

Mỗi bug ghi theo format:

```
| BUG-XX | Sprint | Severity | AC | Description | File:Line | Status |
```

**Severity:**
- 🔴 Critical — feature broken, blocking
- 🟠 High — AC failed, workaround khó
- 🟡 Medium — UX xấu, type mismatch
- ⚪ Low — dead code, cosmetic

**Status flow:**
```
Open → Fixed (Dev) → Verified (QA) → Closed
```

### Bước 3 — Dev Fix

- Dev đọc bug log, fix từng bug
- Sau khi fix, đổi status → `Fixed` trong bug log
- Chạy lại unit tests: tất cả phải pass, coverage ≥ 80%

### Bước 4 — QA Verify

- QA kiểm tra lại từng bug đã `Fixed`
- Dùng `curl` hoặc code review để confirm fix đúng
- Đổi status → `Verified` → `Closed`
- Update `common-bugs-checklist.md` nếu bug thuộc pattern mới

### Bước 5 — Tạo PR

Chỉ tạo PR khi:
- [ ] Tất cả bugs status = `Closed`
- [ ] Unit tests: tất cả pass
- [ ] Coverage ≥ 80%
- [ ] `docker compose up` → app functional

---

## Định nghĩa "Done" cho một Sprint

- [ ] QA test round hoàn tất
- [ ] Bug log cập nhật, tất cả bugs `Closed`
- [ ] Tests pass, coverage ≥ 80%
- [ ] Branch `feature/*` → PR vào `sprint-NN`
- [ ] PO review & approve PR
- [ ] Merge `sprint-NN` → `master`
