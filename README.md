# TaskFlow — AI-SDLC Research Project

A full Software Development Life Cycle (SDLC) simulation using Claude AI agents as team members, building a **Task Management Application** (inspired by Jira/Trello).

## Purpose

This project researches how AI agents can collaborate across every role in a software team — product owner, scrum master, business analyst, frontend developer, backend developer, DevOps engineer, and QA engineer — to deliver a production-grade application sprint by sprint.

## Product: TaskFlow

A web-based task management app with:
- User authentication (register, login, JWT refresh tokens)
- Project management (create, edit, delete, member access control)
- Task boards with status tracking
- Team collaboration features

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, TailwindCSS, Zustand, React Query v5 |
| Backend | Node.js + Express, PostgreSQL, Prisma ORM |
| Testing | Vitest + Testing Library (FE), Jest + Supertest (BE) |
| CI/CD | GitHub Actions |
| IaC | Terraform (AWS EKS) |
| Deploy | Kubernetes |

## AI Team Structure

| Agent | Role |
|-------|------|
| Human (PO) | Product vision, sprint approval, final review |
| Claude Orchestrator | Scrum Master + BA + Tech Lead |
| Claude FE Agent | Frontend Developer (React) |
| Claude BE Agent | Backend Developer (Node.js) |
| Claude DevOps Agent | CI/CD + Infrastructure |
| Claude QA Agent | Test cases + acceptance criteria |

## Sprint Progress

| Sprint | Goal | Points | Status |
|--------|------|--------|--------|
| Sprint 01 | Auth API + Login/Register UI + Docker dev stack | 21/26 | Done |
| Sprint 02 | Projects CRUD API + Dashboard UI + Profile page | 21/21 | In Review |

## Getting Started

### Prerequisites
- Docker + Docker Compose

### Run locally
```bash
docker compose up
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Run tests
```bash
# Backend (integration tests with PostgreSQL)
docker compose -f docker-compose.test.yml up backend-test postgres-test --abort-on-container-exit

# Frontend (unit + component tests)
docker compose -f docker-compose.test.yml up frontend-test --abort-on-container-exit
```

## Project Structure

```
docs/
  sprints/sprint-NN/     # Sprint planning, user stories, review, retrospective
  architecture/          # System design docs
  backlog/               # Product backlog
agents/                  # Agent definitions and prompts
src/
  frontend/              # React + Vite app
  backend/               # Node.js + Express API
infrastructure/
  terraform/             # AWS EKS infrastructure
  k8s/                   # Kubernetes manifests
.github/workflows/       # CI/CD pipelines
```

## License

MIT — see [LICENSE](LICENSE)
