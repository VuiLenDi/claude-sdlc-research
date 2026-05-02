# Sprint 02 User Stories

```
Role:   Orchestrator (Claude — BA function)
Date:   2026-05-02
Sprint: 02 of 04
Status: Approved
```

---

## US-004c — Profile Page (Carry-over)
**As a** logged-in user, **I want to** view and update my profile **so that** my info stays current.

### Acceptance Criteria
- [ ] Profile page accessible via avatar/name in navbar → `/profile`
- [ ] Shows current name and email (email read-only)
- [ ] User can update name with immediate feedback (success toast)
- [ ] User can change password: requires current password, new password, confirm new password
- [ ] Wrong current password → inline error "Current password is incorrect"
- [ ] New password same rules as registration (≥8 chars, letter + number)
- [ ] Back to dashboard link available

---

## US-005 — Create Project
**As a** user, **I want to** create a project **so that** I have a workspace for my tasks.

### Acceptance Criteria
- [ ] "+ New Project" button on dashboard (prominent, empty state too)
- [ ] Modal form: Name (required, 3–100 chars), Description (optional, max 500 chars)
- [ ] On submit: project created, modal closes, dashboard refreshes with new card
- [ ] Creator automatically becomes project owner (role: `owner`)
- [ ] Creator also added to ProjectMember table
- [ ] Duplicate project names within same owner are allowed (not unique constraint)
- [ ] Name < 3 chars → inline validation error before API call

---

## US-006 — Edit Project
**As a** project owner, **I want to** edit project details **so that** they stay accurate.

### Acceptance Criteria
- [ ] Edit button (pencil icon) visible on project card to owner only
- [ ] Reuses same modal as Create with pre-filled values
- [ ] Can update: name, description
- [ ] Dashboard card updates immediately after save (React Query invalidation)
- [ ] Non-owners do not see Edit button; PUT /api/projects/:id returns 403 for non-owners

---

## US-007 — Delete Project
**As a** project owner, **I want to** delete a project **so that** I can clean up old work.

### Acceptance Criteria
- [ ] Delete button (trash icon) visible on project card to owner only
- [ ] Confirmation dialog: "Delete project '{name}'? This cannot be undone."
- [ ] On confirm: project + all tasks cascade-deleted, dashboard refreshes
- [ ] Non-owners see 403 from API
- [ ] Deleting last project shows empty state on dashboard

---

## US-008 — Dashboard
**As a** user, **I want to** see all my projects on a dashboard **so that** I can switch between them.

### Acceptance Criteria
- [ ] `/dashboard` is the landing page after login
- [ ] Shows project cards: name, description (truncated), task count, member count
- [ ] Projects sorted by `updatedAt` descending (most recently active first)
- [ ] Empty state: "No projects yet — create your first one" with Create button
- [ ] Clicking project card navigates to `/projects/:id` (placeholder page for Sprint 03)
- [ ] Navbar shows user name/avatar, links: Dashboard, Profile, Logout
