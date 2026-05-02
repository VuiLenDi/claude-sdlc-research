# Daily Standup — Sprint 01 Day 2

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-04-28
Sprint: 01 | Day: 2 of 2
Time:   End of Day 2 (actual execution)
```

---

## Agent Status Reports

### BE Agent
**Today**:
- [x] All auth API endpoints implemented and running
- [x] Prisma schema applied to dev DB via `db push`
- [x] Server running at :8080 with hot-reload (tsx watch)
- [x] **BUG FIXED**: Refresh token unique constraint violation when JWT signed in same second
  - Root cause: `jwt.sign` produces identical tokens for same userId within same second
  - Fix: Added `jti` (JWT ID) claim using `uuid()` to guarantee token uniqueness
  - Impact: Production bug — would cause 500 errors for rapid login attempts
**Blockers**: None

### DevOps Agent
**Today**:
- [x] docker-compose.yml updated — dev mode uses Dockerfile.test (no lock file required)
- [x] docker-compose.test.yml created for isolated test runs
- [x] Full stack deployed successfully: postgres + backend + frontend
- [x] Prisma DB schema auto-applied on backend start
**Blockers**: None

### FE Agent
**Today**:
- [x] LoginPage — renders, validates, submits, shows error
- [x] RegisterPage — renders with all fields
- [x] Zustand auth store with persist middleware
- [x] Auth service with Axios interceptor (auto refresh token)
- [x] Protected/public route guards
**Blockers**: None

### QA Agent
**Today**: All tests green
- [x] **Backend (8/8 PASS)** — integration tests against real PostgreSQL
  - POST /api/auth/register: 201, 409 duplicate, 400 weak password
  - POST /api/auth/login: 200 success, 401 wrong password, 401 unknown email
  - GET /api/auth/me: 200 with token, 401 without token
  - **Coverage: 75.55% statements, 42.85% branches, 68.42% functions**
- [x] **Frontend (4/4 PASS)** — component tests with jsdom
  - LoginPage: renders, validation errors, API call, error state
  - **Bug found & fixed**: React Query v5 passes mutation context as 2nd arg to mutationFn — test assertion updated to use `expect.anything()` for context
  - **Coverage: 41.97% statements** (low — only LoginPage covered, RegisterPage next sprint)

---

## End-to-End Verification (Live)

```
GET  /health             → 200 {"status":"ok"}          ✓
POST /api/auth/register  → 201 with user + accessToken   ✓
POST /api/auth/login     → 200 with user + accessToken   ✓
GET  /api/auth/me        → 200 user profile (no password in response) ✓
POST /api/auth/login     → 401 wrong password (INVALID_CREDENTIALS)  ✓
POST /api/auth/register  → 409 duplicate email (EMAIL_EXISTS)        ✓
Frontend                 → HTTP 200, React app served                ✓
```

---

## Bugs Found & Fixed This Sprint

| ID | Severity | Description | Fix | Agent |
|----|----------|-------------|-----|-------|
| BUG-01 | High | JWT refresh token unique constraint violation under rapid requests | Added `jti` UUID claim to refresh token | BE Agent |
| BUG-02 | Low | React Query v5 mutation context arg breaks `toHaveBeenCalledWith` assertion | Updated test to use `expect.anything()` | QA Agent |

---

## Sprint 01 Coverage Report

### Backend
| Module | Statements | Branches | Functions |
|--------|-----------|---------|----------|
| middleware/auth | 91.66% | 100% | 100% |
| middleware/errorHandler | 80% | 100% | 100% |
| models/prisma | 100% | 100% | 100% |
| routes/auth | 71.79% | 0% | 50% |
| services/authService | 69.35% | 21.42% | 62.5% |
| utils/AppError | 100% | 100% | 100% |
| **TOTAL** | **75.55%** | **42.85%** | **68.42%** |

> Branch coverage low (42.85%) — refresh/logout/updateUser paths not covered. Sprint 02 will add these tests.

### Frontend
| Module | Statements | Branches | Functions |
|--------|-----------|---------|----------|
| LoginPage | 100% | 90% | 100% |
| RegisterPage | 0% | 0% | 0% |
| authStore | 89.18% | 100% | 60% |
| authService | 39.72% | 100% | 0% |
| **TOTAL** | **41.97%** | **70.58%** | **29.41%** |

> Coverage intentionally low — only Sprint 01 stories implemented. RegisterPage tests in Sprint 02.

---

## Sprint 01 Velocity
- Committed: 26 points (US-001 to US-005)
- Completed: US-001, US-002, US-003 fully done + tested
- US-004 (Profile), US-005 (Create Project): API implemented, FE stubs only
- **Actual velocity: ~18 points** (auth complete, project/profile FE carried to Sprint 02 Day 1)

---

## Services Running
| Service | URL | Status |
|---------|-----|--------|
| Backend API | http://localhost:8080 | Running |
| Frontend App | http://localhost:3000 | Running |
| PostgreSQL | localhost:5432 | Healthy |
