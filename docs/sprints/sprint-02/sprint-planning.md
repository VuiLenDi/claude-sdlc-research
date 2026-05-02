# Sprint 02 Planning — Project Management

```
Role:   Orchestrator (Claude — Scrum Master function)
Date:   2026-05-02
Sprint: 02 of 04
Status: Active
```

---

## Sprint Goal
> **"Users can create, view, edit, and delete projects. A real dashboard replaces the placeholder. Profile management closes the auth epic. This unlocks task management in Sprint 03."**

---

## Sprint Timeline

| Day | Hours | Activities |
|-----|-------|-----------|
| Day 1 (2026-05-02) | 0–8h | BE: Projects CRUD API + tests; FE: Layout + DashboardPage |
| Day 2 (2026-05-03) | 8–16h | FE: ProfilePage + ProjectPage; QA: full coverage pass; CI/CD green |

---

## Committed Stories

| ID | Story | Assignee | Points | Status |
|----|-------|---------|--------|--------|
| US-004c | Profile FE (carry-over) | FE Agent | 3 | To Do |
| US-005 | Create Project | BE Agent + FE Agent | 5 | To Do |
| US-006 | Edit Project | BE Agent + FE Agent | 3 | To Do |
| US-007 | Delete Project | BE Agent + FE Agent | 5 | To Do |
| US-008 | Dashboard (all projects) | BE Agent + FE Agent | 5 | To Do |
| **Total** | | | **21** | |

> Sprint capacity: 22 pts (calibrated from Sprint 01 velocity)

---

## Task Breakdown

### BE Agent Tasks (Day 1)
| Task | Story | Est. Hours |
|------|-------|-----------|
| BE-T08: POST /api/projects | US-005 | 1h |
| BE-T09: GET /api/projects (list mine) | US-008 | 0.5h |
| BE-T10: GET /api/projects/:id | US-005 | 0.5h |
| BE-T11: PUT /api/projects/:id | US-006 | 1h |
| BE-T12: DELETE /api/projects/:id | US-007 | 1h |
| BE-T13: Integration tests (projects suite) | All | 2h |

### FE Agent Tasks (Day 1–2)
| Task | Story | Est. Hours |
|------|-------|-----------|
| FE-T09: AppLayout (navbar + sidebar skeleton) | All | 1.5h |
| FE-T10: DashboardPage (project cards grid) | US-008 | 1.5h |
| FE-T11: CreateProjectModal | US-005 | 1h |
| FE-T12: EditProjectModal | US-006 | 1h |
| FE-T13: DeleteProjectDialog | US-007 | 0.5h |
| FE-T14: ProfilePage | US-004c | 1h |
| FE-T15: projectService (API calls) | All | 0.5h |
| FE-T16: Update App.tsx routing | All | 0.5h |

### QA Tasks (Day 2)
| Task | Story | Est. Hours |
|------|-------|-----------|
| QA-T05: DashboardPage component tests | US-008 | 1h |
| QA-T06: ProfilePage component tests | US-004c | 0.5h |
| QA-T07: Coverage gate verification ≥80% | All | 0.5h |

---

## API Design

### Projects Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/projects | ✅ | Create project (caller becomes owner) |
| GET | /api/projects | ✅ | List projects where caller is member/owner |
| GET | /api/projects/:id | ✅ member | Get project detail |
| PUT | /api/projects/:id | ✅ owner/admin | Update name + description |
| DELETE | /api/projects/:id | ✅ owner | Delete project + cascade |

### Response Shape
```json
{ "data": { "id": "uuid", "name": "...", "description": "...", "ownerId": "...", "memberCount": 1, "taskCount": 0, "createdAt": "..." } }
```

---

## Definition of Done

- [ ] All AC for committed stories met
- [ ] `docker compose up` → app functional, dashboard shows projects
- [ ] BE integration tests ≥80% coverage, all pass
- [ ] FE component tests ≥80% coverage, all pass
- [ ] Feature on branch `feature/sprint-02`
- [ ] PO notified and approved before merge to master
- [ ] No new security vulnerabilities

---

## Risks

| Risk | Mitigation |
|------|-----------|
| FE state management complexity (project list) | Use React Query for server state, keep Zustand for auth only |
| Modal form reuse between Create/Edit | Single ProjectFormModal with `mode` prop |
| Delete cascade confirmation UX | Simple dialog — no type-to-confirm for v1 (US-007 AC adjusted) |
