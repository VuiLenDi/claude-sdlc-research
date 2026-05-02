# System Design — TaskFlow

```
Role:   Orchestrator (Claude — Tech Lead function)
Date:   Sprint 0 — Day 0 (2026-04-28)
Sprint: Pre-Sprint (Architecture)
Status: Approved
```

---

## Architecture Overview

TaskFlow follows a **containerized microservices-ready monolith** architecture:
- Start as a modular monolith (faster to build, easier to debug)
- Each module is independently deployable when needed (split-ready)
- All services run in Kubernetes from day one

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                     Ingress (nginx)                          │
│                  (K8s Ingress Controller)                    │
└──────────┬────────────────────────────┬─────────────────────┘
           │                            │
┌──────────▼──────────┐    ┌────────────▼────────────────────┐
│   Frontend Service  │    │       Backend API Service        │
│   React.js (Vite)   │    │    Node.js + Express REST API    │
│   Port: 3000        │    │    Port: 8080                    │
│   K8s: 2 replicas   │    │    K8s: 3 replicas               │
└─────────────────────┘    └────────────┬────────────────────┘
                                        │
                           ┌────────────▼────────────────────┐
                           │        PostgreSQL                │
                           │   (AWS RDS or K8s StatefulSet)  │
                           │   Managed by Prisma ORM          │
                           └─────────────────────────────────┘
```

---

## Tech Stack Decisions

### Frontend
| Choice | Rationale |
|--------|-----------|
| **React.js + Vite** | Fast HMR, modern tooling, large ecosystem |
| **TailwindCSS** | Utility-first, consistent design without custom CSS |
| **Zustand** | Lightweight state management (Redux is overkill for MVP) |
| **React Query** | Server state management, caching, background refetch |
| **React Router v6** | Client-side routing |
| **dnd-kit** | Drag-and-drop for Kanban (accessible, modern) |

### Backend
| Choice | Rationale |
|--------|-----------|
| **Node.js + Express** | Team familiarity, fast iteration, large ecosystem |
| **PostgreSQL** | ACID compliance, relational data fits task management |
| **Prisma ORM** | Type-safe queries, auto-migrations, great DX |
| **JWT + Refresh tokens** | Stateless auth, scalable across replicas |
| **bcrypt** | Password hashing |
| **Zod** | Runtime request validation |

### Infrastructure
| Choice | Rationale |
|--------|-----------|
| **AWS EKS** | Managed K8s, production-grade |
| **Terraform** | IaC, reproducible environments |
| **GitHub Actions** | Native GitHub integration, free for public repos |
| **Docker** | Containerization for consistent environments |
| **AWS ECR** | Container registry (integrates with EKS) |

---

## Database Schema

```
users
  id          UUID PK
  email       VARCHAR(255) UNIQUE
  password    VARCHAR(255) -- bcrypt hash
  name        VARCHAR(100)
  avatar_url  TEXT
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

projects
  id          UUID PK
  name        VARCHAR(100)
  description TEXT
  owner_id    UUID FK → users.id
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

project_members
  project_id  UUID FK → projects.id
  user_id     UUID FK → users.id
  role        ENUM('owner', 'admin', 'member')
  joined_at   TIMESTAMP
  PRIMARY KEY (project_id, user_id)

sprints
  id          UUID PK
  project_id  UUID FK → projects.id
  name        VARCHAR(100)
  goal        TEXT
  status      ENUM('planning', 'active', 'completed')
  start_date  DATE
  end_date    DATE
  created_at  TIMESTAMP

tasks
  id           UUID PK
  project_id   UUID FK → projects.id
  sprint_id    UUID FK → sprints.id (nullable)
  title        VARCHAR(255)
  description  TEXT
  status       ENUM('todo', 'in_progress', 'review', 'done')
  priority     ENUM('low', 'medium', 'high', 'critical')
  assignee_id  UUID FK → users.id (nullable)
  reporter_id  UUID FK → users.id
  story_points INT
  position     INT -- for ordering within column
  due_date     DATE
  created_at   TIMESTAMP
  updated_at   TIMESTAMP

task_comments
  id          UUID PK
  task_id     UUID FK → tasks.id
  user_id     UUID FK → users.id
  content     TEXT
  created_at  TIMESTAMP
```

---

## API Design (REST)

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Projects
```
GET    /api/projects              -- list user's projects
POST   /api/projects              -- create project
GET    /api/projects/:id          -- get project detail
PUT    /api/projects/:id          -- update project
DELETE /api/projects/:id          -- delete project
POST   /api/projects/:id/members  -- invite member
DELETE /api/projects/:id/members/:userId
```

### Tasks
```
GET    /api/projects/:id/tasks        -- list tasks (filterable)
POST   /api/projects/:id/tasks        -- create task
GET    /api/projects/:id/tasks/:taskId
PUT    /api/projects/:id/tasks/:taskId
DELETE /api/projects/:id/tasks/:taskId
PATCH  /api/projects/:id/tasks/:taskId/status
PATCH  /api/projects/:id/tasks/:taskId/position
```

### Sprints
```
GET    /api/projects/:id/sprints
POST   /api/projects/:id/sprints
PUT    /api/projects/:id/sprints/:sprintId
POST   /api/projects/:id/sprints/:sprintId/start
POST   /api/projects/:id/sprints/:sprintId/complete
```

---

## Security Architecture

- All endpoints require JWT (except register/login)
- JWT access token: 15 minutes TTL
- Refresh token: 7 days TTL, stored in httpOnly cookie
- Rate limiting: 100 req/min per IP on auth endpoints
- CORS: whitelist frontend domain only
- Helmet.js: security headers
- Input validation: Zod on every route
- SQL injection: prevented by Prisma parameterized queries

---

## Environment Strategy

| Environment | Purpose | Config |
|-------------|---------|--------|
| `development` | Local dev | Docker Compose, local PostgreSQL |
| `staging` | Pre-prod testing | K8s on EKS, shared DB |
| `production` | Live users | K8s on EKS, RDS PostgreSQL |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| Frontend TTI (Time to Interactive) | < 2s |
| Uptime | > 99.5% |
| DB query time (p95) | < 50ms |
