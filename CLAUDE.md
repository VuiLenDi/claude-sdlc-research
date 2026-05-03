# AI-SDLC Research Project — Task Management App

## Project Overview
This is a research project simulating a full SDLC lifecycle using AI agents as team members.
The product being built is a **Task Management Application** (similar to Jira/Trello).

## Team Structure

| Entity | Role | Responsibilities |
|--------|------|-----------------|
| Human (user) | Product Owner | Vision, priorities, final approval, sprint reviews |
| Claude Orchestrator | Scrum Master + BA + Tech Lead | Sprint planning, requirements → user stories, architecture, code review |
| Claude FE Agent | Frontend Developer | React.js implementation |
| Claude BE Agent | Backend Developer | Node.js API implementation |
| Claude DevOps Agent | DevOps Engineer | GitHub Actions, Terraform, Kubernetes |
| Claude QA Agent | QA Engineer | Test cases, acceptance criteria validation |

## Tech Stack
- **Frontend**: React.js (Vite), TailwindCSS, Zustand
- **Backend**: Node.js, Express, PostgreSQL, Prisma ORM
- **CI/CD**: GitHub Actions
- **IaC**: Terraform (AWS EKS)
- **Deploy**: Kubernetes (K8s)

## Sprint Rhythm
- 1 sprint = 16 hours (2 working days)
- Each sprint produces: planning doc, user stories, code, tests, review, retrospective

## Document Conventions
Every document starts with a header block:
```
Role: <who produced this>
Date: <sprint day>
Sprint: <sprint number>
Status: <Draft | Review | Approved>
```

## Directory Structure
```
docs/
  vision/          → Product vision (PO)
  architecture/    → System design (Orchestrator)
  backlog/         → Product backlog (Orchestrator + PO)
  sprints/         → Per-sprint artifacts
    sprint-NN/
      sprint-planning.md
      user-stories.md
      daily-standups/
      sprint-review.md
      sprint-retrospective.md
agents/            → Agent definitions and prompts
src/
  frontend/        → React.js app
  backend/         → Node.js API
infrastructure/
  terraform/       → AWS IaC
  k8s/             → Kubernetes manifests
.github/workflows/ → CI/CD pipelines
```

## How to Run a Sprint
1. PO reviews backlog and confirms sprint goal
2. Orchestrator runs sprint planning → `docs/sprints/sprint-NN/sprint-planning.md`
3. FE + BE agents implement assigned stories
4. DevOps agent maintains pipeline and infra
5. **QA Agent — test round bắt buộc trước PR** (xem `docs/qa/qa-process.md`):
   a. Test API + FE logic theo `docs/qa/common-bugs-checklist.md`
   b. Ghi tất cả bugs vào `docs/qa/bug-log.md` (status = Open)
   c. FE/BE Agent fix bugs → đổi status = Fixed
   d. QA verify fix → đổi status = Closed
   e. Chỉ tạo PR khi tất cả bugs = Closed, tests pass, coverage ≥ 80%
6. Orchestrator writes sprint review + retrospective
7. PO approve PR → merge `feature/*` → `sprint-NN` → `master`

## QA Artifacts
- `docs/qa/qa-process.md` — quy trình QA đầy đủ
- `docs/qa/bug-log.md` — log tất cả bugs theo sprint, có status tracking
- `docs/qa/common-bugs-checklist.md` — checklist các bug hay tái xuất hiện
