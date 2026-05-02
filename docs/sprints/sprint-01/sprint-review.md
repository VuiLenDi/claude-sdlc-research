# Sprint 01 Review — Authentication Foundation

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-02
Sprint: 01 of 04
Status: Review Complete
```

---

## Sprint Goal (Recap)
> "Users can register, login, and manage their accounts. The core authentication infrastructure is in place for all future features."

---

## Demo Results

### ✅ Delivered & Accepted

| Story | Description | Evidence |
|-------|-------------|----------|
| US-001 | User Registration | POST /api/auth/register → 201, FE RegisterPage with validation |
| US-002 | User Login | POST /api/auth/login → 200 + httpOnly refresh cookie, FE LoginPage |
| US-003 | User Logout | POST /api/auth/logout → 200, cookie cleared |
| US-004 BE | Profile API | GET/PUT /api/auth/me → 200, password change with current-password check |

### ⚠️ Partially Delivered (Carry to Sprint 02)

| Story | Missing | Reason |
|-------|---------|--------|
| US-004 FE | ProfilePage component | Deprioritised — auth core took full capacity |
| US-005 | Create Project (BE + FE) | Scheduled S01→S02 boundary; schema ready |

---

## Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| BE test coverage (statements) | ≥ 80% | **96.29%** ✅ |
| BE test coverage (branches) | ≥ 80% | **80.95%** ✅ |
| BE test coverage (functions) | ≥ 80% | **100%** ✅ |
| FE test coverage (statements) | ≥ 80% | **100%** ✅ |
| FE test coverage (branches) | ≥ 80% | **96.77%** ✅ |
| BE tests passing | 23/23 | **23/23** ✅ |
| FE tests passing | 20/20 | **20/20** ✅ |
| `docker compose up` functional | Yes | **Yes** ✅ |
| Security vulnerabilities | 0 critical | **0** ✅ |

---

## Acceptance Criteria Check

### US-001 Registration
- [x] Form: email, password, confirm password, name
- [x] Duplicate email → 409 + inline error
- [x] Password ≥ 8 chars, letter + number enforced
- [x] On success → redirected to dashboard
- [x] On failure → inline error messages

### US-002 Login
- [x] Form: email + password
- [x] On success → redirect to dashboard
- [x] On failure → generic error (email existence not revealed)
- [x] JWT in memory; refresh token in httpOnly cookie
- [x] "Forgot password" link visible (disabled, v1 scope)

### US-003 Logout
- [x] Logout clears all tokens
- [x] Redirects to /login
- [x] Session expires after 15 min (access token TTL)

### US-004 Profile — BE only
- [x] GET /me returns name, email (no password)
- [x] PUT /me updates name
- [x] PUT /me changes password (requires currentPassword)
- [ ] FE ProfilePage → carried to Sprint 02

---

## PO Feedback
> Sprint 01 delivered the full auth backend and login/register UI on schedule.
> ProfilePage and project creation are acceptable carry-overs — no scope creep.
> Sprint 02 to complete project management and give users a real landing experience.

---

## Velocity
- Committed: 26 story points
- Delivered: 21 story points (US-004 FE + US-005 not delivered)
- Carry-over: 5 points (US-004 FE = 2pt partial, US-005 = 5pt)
