# Sprint 01 Retrospective

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-02
Sprint: 01 of 04
Status: Approved
```

---

## What Went Well ✅

| Item | Detail |
|------|--------|
| Test coverage exceeded target | BE hit 96% statements vs 80% target |
| Auth security solid | jti on refresh tokens prevents duplicate-token DB constraint bugs |
| Docker dev environment works first time | docker compose up → app functional with no manual steps |
| Rate limiter correctly bypassed in test env | No 429 flakiness in integration tests |
| Feature isolation with userEvent.setup() | v14 pattern fixed event-sequencing bugs in FE tests |

---

## What Went Wrong ⚠️

| Issue | Root Cause | Impact |
|-------|-----------|--------|
| BUG-01: Duplicate refresh token (unique constraint) | `jwt.sign` same-second produces identical token; no jti | Registration 500 error in test |
| BUG-02: React Query v5 mutationFn receives 2 args | mutationFn = `authService.login` gets `(vars, context)` | Test assertion false-negative |
| Rate limiter hitting 429 in tests | 20 req/min limit, 23 test requests per suite | All integration tests failed |
| Stale DB data between runs | Postgres volume persisted between test runs | 409 on second run |
| ProfilePage not delivered | Underestimated FE work for Profile + Project in one sprint | Carry-over to Sprint 02 |

---

## Action Items (Sprint 02)

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| A01 | Add feature branch workflow — each story on `feature/*` branch | All agents | **Critical** |
| A02 | PO approval required before merge to master | Orchestrator | **Critical** |
| A03 | Split BE + FE tasks more conservatively (underestimation pattern) | Orchestrator | High |
| A04 | ProfilePage as first story in Sprint 02 (quick win, closes auth epic) | FE Agent | High |
| A05 | Add Prisma migration guard in test teardown to avoid stale data | BE Agent | Medium |

---

## Process Notes for Sprint 02

- **Branch strategy**: All work on `feature/sprint-02`, sub-branches per story if needed
- **Definition of Done** (updated):
  1. Local dev stack passes (`docker compose up`)
  2. All tests pass with ≥80% coverage
  3. Code on feature branch (not master)
  4. PO notified and approved before merge
- **Velocity calibration**: Sprint 01 delivered 21/26 pts → Sprint 02 capacity: ~22 points
