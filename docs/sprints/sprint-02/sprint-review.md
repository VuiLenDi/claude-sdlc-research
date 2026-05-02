Role: Orchestrator (Scrum Master)
Date: Sprint 02, Day 2
Sprint: 02
Status: Review

# Sprint 02 Review

## Sprint Goal
Deliver project CRUD — backend REST API, frontend dashboard UI, and user profile page — so users can register, log in, manage projects, and update their profile.

## Team
| Agent | Deliverables |
|-------|-------------|
| BE Agent | Projects API (US-004a, US-004b) |
| FE Agent | DashboardPage, AppLayout, ProjectFormModal, DeleteProjectDialog, profileService (US-004c, US-005–007) |
| QA Agent | Integration tests (BE), unit/component tests (FE) |

## Stories Delivered

| Story | Points | Status | Notes |
|-------|--------|--------|-------|
| US-004a: Projects CRUD API | 5 | Done | 16 integration tests, 97.4% stmt coverage |
| US-004b: Auth middleware on projects | 2 | Done | Bundled with US-004a |
| US-004c: Profile page | 3 | Done | Name + password update, WRONG_PASSWORD error handling, 7 tests |
| US-005: List projects dashboard | 3 | Done | React Query, empty state, project cards |
| US-006: Create project modal | 3 | Done | Zod validation, onSuccess closes modal |
| US-007: Edit / delete project | 5 | Done | Owner-only controls, confirm dialog |
| **Total** | **21** | **21/21** | |

## Acceptance Criteria Validation

### US-004a/b — Projects API
- POST /api/projects creates project, adds creator as owner member ✓
- GET /api/projects returns only caller's projects ✓
- PUT /api/projects/:id returns 403 for non-owner/admin ✓
- DELETE /api/projects/:id returns 403 for non-owner ✓
- Unauthenticated requests return 401 ✓

### US-004c — Profile Page
- Name update persists and reflects immediately ✓
- Wrong current password → "Current password is incorrect" ✓
- Validation: name required, passwords match ✓

### US-005–007 — Dashboard UI
- Loading, empty, error states all rendered ✓
- Project cards show name, task count, member count ✓
- Edit/Delete buttons only visible to project owner ✓
- Create modal opens/closes and calls API ✓
- Edit modal pre-fills existing data ✓
- Delete dialog shows project name and cannot-be-undone warning ✓

## Test Results
| Suite | Tests | Coverage |
|-------|-------|----------|
| Backend (Jest) | 39/39 pass | 97.4% stmts, 100% funcs |
| Frontend (Vitest) | 37/37 pass | 98.5% stmts, 87.5% funcs |

## Demo Notes
- Dev stack runs via `docker compose up` on ports 3000 (FE) and 8080 (BE)
- Register → Login → Dashboard → Create Project → Edit → Delete flow fully functional end-to-end
- Profile update flow functional

## Branch Status
- `feature/us-004c-profile-page` → merged to `sprint-02`
- `feature/projects-api` → merged to `sprint-02`
- `feature/projects-ui` → merged to `sprint-02`
- `sprint-02` → **awaiting PO approval to merge to `master`**
