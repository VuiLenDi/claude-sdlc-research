Role: Orchestrator (Scrum Master)
Date: Sprint 02, Day 2
Sprint: 02
Status: Draft

# Sprint 02 Retrospective

## What Went Well
- Full 21/21 story points delivered — first sprint with 100% completion rate
- BE integration test namespace isolation pattern (`@proj-test.taskflow` vs `@test.taskflow`) prevented parallel Jest worker collisions discovered in S01
- `mutationFn` wrapper pattern for `updateProject` (anonymous function) vs direct reference for `createProject`/`deleteProject` kept React Query context handling correct and explicit
- `NODE_ENV !== 'test'` guard on `app.listen()` eliminated EADDRINUSE flakiness from S01 carry-over
- Shared `ProjectFormModal` (create + edit via `project` prop) kept component count low

## What Was Difficult
- React Query v5 passes `(variables, context)` to directly-referenced `mutationFn`s but NOT to wrapped ones — required different `toHaveBeenCalledWith` signatures per mutation, which was non-obvious
- V8 coverage counts arrow callbacks inside `useMutation.onSuccess` as separate functions — needed dedicated `waitFor` assertions to confirm modal-close side effects, not just API call assertions
- `docker compose up` runs FE and BE test containers concurrently; FE finishes first and triggers `--abort-on-container-exit`, killing the BE mid-run — must run containers separately for reliable CI results

## Action Items for Sprint 03
- [ ] Split docker-compose.test.yml to run BE and FE sequentially (or use `depends_on: condition: service_completed_successfully`)
- [ ] Add task management API: GET/POST/PUT/DELETE /api/projects/:id/tasks
- [ ] Add task board UI: columns by status (todo/in-progress/done), drag-and-drop
- [ ] Add member invitation endpoint and UI
- [ ] Consider adding a `test:ci` npm script that runs BE then FE and aggregates exit codes

## Metrics
| Metric | S01 | S02 |
|--------|-----|-----|
| Story points planned | 26 | 21 |
| Story points delivered | 21 | 21 |
| Velocity | 21 | 21 |
| Tests written | 20 | 39+37=76 total cumulative |
| Bugs found in sprint | 3 | 2 |
| Carry-over | 5 pts | 0 pts |
