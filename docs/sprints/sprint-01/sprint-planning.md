# Sprint 01 Planning — Authentication Foundation

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-04-28
Sprint: 01 of 04
Status: Active
```

---

## Sprint Goal
> **"Users can register, login, and manage their accounts. The core authentication infrastructure is in place for all future features."**

---

## Sprint Timeline

| Day | Hours | Activities |
|-----|-------|-----------|
| Day 1 (2026-04-28) | 0–8h | BE: Auth API + DB schema; DevOps: Docker + CI pipeline |
| Day 2 (2026-04-29) | 8–16h | FE: Auth pages; BE: Profile API; QA: Test suite |

---

## Committed Stories

| ID | Story | Assignee | Points | Status |
|----|-------|---------|--------|--------|
| US-001 | User Registration | BE Agent + FE Agent | 5 | To Do |
| US-002 | User Login | BE Agent + FE Agent | 5 | To Do |
| US-003 | User Logout | BE Agent + FE Agent | 3 | To Do |
| US-004 | User Profile | BE Agent + FE Agent | 8 | To Do |
| US-005 | Create Project | BE Agent + FE Agent | 5 | To Do |
| **Total** | | | **26** | |

> Sprint capacity: 16h × 4 agents = 64 agent-hours
> Story point velocity target: 26 points (sprint 1 baseline)

---

## Task Breakdown

### BE Agent Tasks (Day 1)
| Task | Story | Est. Hours |
|------|-------|-----------|
| BE-T01: Set up Express project structure | All | 1h |
| BE-T02: Configure Prisma + PostgreSQL schema (users, projects) | US-001 | 1h |
| BE-T03: Implement POST /api/auth/register | US-001 | 1.5h |
| BE-T04: Implement POST /api/auth/login + JWT | US-002 | 1.5h |
| BE-T05: Implement POST /api/auth/logout + refresh | US-003 | 1h |
| BE-T06: Implement GET/PUT /api/auth/me (profile) | US-004 | 1.5h |
| BE-T07: Implement POST /api/projects | US-005 | 1.5h |

### FE Agent Tasks (Day 2)
| Task | Story | Est. Hours |
|------|-------|-----------|
| FE-T01: Set up React + Vite + TailwindCSS project | All | 1h |
| FE-T02: Set up React Router + Zustand store | All | 0.5h |
| FE-T03: Build RegisterPage component | US-001 | 1.5h |
| FE-T04: Build LoginPage component | US-002 | 1h |
| FE-T05: Build auth service (API calls + token handling) | US-001/002 | 1h |
| FE-T06: Build protected route HOC | US-002 | 0.5h |
| FE-T07: Build ProfilePage component | US-004 | 1.5h |
| FE-T08: Build CreateProjectModal component | US-005 | 1h |

### DevOps Agent Tasks (Day 1, parallel)
| Task | Story | Est. Hours |
|------|-------|-----------|
| DO-T01: Write Dockerfile for BE | All | 0.5h |
| DO-T02: Write Dockerfile for FE (multi-stage) | All | 0.5h |
| DO-T03: Write docker-compose.yml (dev env) | All | 0.5h |
| DO-T04: Set up GitHub Actions CI pipeline (lint + test) | All | 1h |
| DO-T05: Write K8s base manifests (backend deployment + service) | All | 1h |
| DO-T06: Write Terraform EKS module skeleton | All | 1h |

### QA Agent Tasks (Day 2, parallel)
| Task | Story | Est. Hours |
|------|-------|-----------|
| QA-T01: Write BE integration tests for auth endpoints | US-001/002/003 | 2h |
| QA-T02: Write BE unit tests for auth service | US-001/002 | 1h |
| QA-T03: Write FE component tests (RegisterPage, LoginPage) | US-001/002 | 1.5h |
| QA-T04: Write E2E test script: register → login → logout flow | US-001/002/003 | 1.5h |

---

## Definition of Done (Sprint 01)

- [ ] All acceptance criteria for committed stories are met
- [ ] BE API endpoints return correct HTTP status codes
- [ ] FE forms have validation with user-friendly error messages
- [ ] All routes protected appropriately (auth guard)
- [ ] Unit test coverage > 80% for auth module
- [ ] Integration tests pass in CI pipeline
- [ ] Docker Compose: app runs with `docker-compose up`
- [ ] No critical or high security vulnerabilities
- [ ] Code reviewed by Orchestrator (Tech Lead function)

---

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| PostgreSQL connection issues in Docker | Low | Medium | Use docker-compose health checks |
| JWT refresh token complexity | Medium | High | Use battle-tested library (jsonwebtoken) |
| FE/BE CORS configuration | Low | Medium | Configure early in DevOps setup |

---

## Sprint 01 Communication Log

| Timestamp | Agent | Message |
|-----------|-------|---------|
| 2026-04-28 09:00 | Orchestrator | Sprint 01 planning complete. Kicking off parallel Day 1 tasks. BE Agent and DevOps Agent start immediately. |
