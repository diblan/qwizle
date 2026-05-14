```md
# First full-stack login slice for Qwizle

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document is maintained in accordance with `PLANS.md` at the repository root.

## Purpose / Big Picture

After this change, Qwizle will have its first runnable frontend and backend code. A visitor can open a public homepage, navigate to a login page, sign in with a seeded learner account, and land on a logged-in home page that confirms who they are. The backend will own user data through a Flyway-managed database schema, expose a REST login endpoint, and provide a session-like token that the Angular frontend stores locally.

The result should be observable with one local command from the repository root: start the stack, open the Angular app, log in as `learner@qwizle.test` with password `qwizle123`, and see the member home page.

## Progress

- [x] (2026-05-14 00:00Z) Read repository instructions in `AGENTS.md` and ExecPlan requirements in `PLANS.md`.
- [x] (2026-05-14 00:02Z) Created this initial self-contained ExecPlan in `docs/execplans/0001-first-full-stack-login.md`.
- [x] (2026-05-14 00:12Z) Scaffolded Spring Boot backend under `api/` with Flyway, Postgres support, security, REST login, demo user seeding, and MockMvc tests.
- [x] (2026-05-14 00:20Z) Scaffolded Angular frontend under `app/` with routing, public home, login page, logged-in home, Tailwind/SpartanUI-style styling, auth service, guard, interceptor, and component/service tests.
- [x] (2026-05-14 00:24Z) Added root `docker-compose.yml`, API/frontend Dockerfiles, root README, and backend/frontend README updates for one-command local run and testing.
- [x] (2026-05-14 00:29Z) Attempted backend and frontend dependency-backed checks; both are blocked by registry 403 responses in this environment, so validation evidence is recorded as warnings.

## Surprises & Discoveries

- Observation: Maven cannot download Spring Boot dependencies from Maven Central in this environment.
  Evidence: `mvn test` failed with HTTP 403 while resolving `org.springframework.boot:spring-boot-starter-parent:3.5.0`.

- Observation: npm cannot download Angular dependencies from the npm registry in this environment.
  Evidence: `npm install` failed with HTTP 403 while resolving `@angular/animations`.

## Decision Log

- Decision: Use a minimal token table instead of introducing JWT signing infrastructure in the first slice.
  Rationale: The user asked for a simple first implementation. A server-issued opaque token stored in Postgres is easy to test, revoke later, and evolve into richer auth without adding unnecessary cryptographic complexity now.
  Date/Author: 2026-05-14 / Codex

- Decision: Keep advanced learner tracking and progression out of scope.
  Rationale: Repository product direction lists detailed learner track records and weighted reappearance logic as non-goals for now.
  Date/Author: 2026-05-14 / Codex

- Decision: Use SpartanUI's documented Angular approach: Tailwind CSS plus Spartan-generated helm components backed by `@spartan-ng/brain` primitives.
  Rationale: The user explicitly requested SpartanUI with Angular; the official Spartan docs describe this two-layer model and CLI workflow.
  Date/Author: 2026-05-14 / Codex

## Outcomes & Retrospective

Implemented the first full-stack Qwizle slice in source code and documentation. The backend includes auth tables, demo seeding, login/current-user endpoints, and tests. The frontend includes the public homepage, login page, logged-in learner homepage, local token storage, route guard, interceptor, and tests. Dependency-backed test execution could not complete because the environment returned HTTP 403 from Maven Central and npm registry requests; the source tree is ready for the same commands in a network-enabled environment.

## Context and Orientation

The repository currently contains placeholder folders only:

- `api/README.md` reserves `api/` for the Spring Boot REST API backend.
- `app/README.md` reserves `app/` for the Angular frontend.
- `AGENTS.md` defines Qwizle as a daily learning and long-term retention app.
- `PLANS.md` defines how this ExecPlan must be written and maintained.

Terms used in this plan:

- Spring Boot: a Java framework for building the backend web API.
- Flyway: a migration tool that applies versioned SQL files so databases are reproducible.
- Postgres: the production-style relational database selected for Qwizle.
- Angular: the TypeScript frontend framework selected for Qwizle.
- SpartanUI: an Angular component approach inspired by shadcn/ui. It combines accessible behavior packages with copied, customizable component styles.
- REST API: HTTP endpoints that exchange JSON.
- Opaque token: a random string with no embedded user data; the backend looks it up in a database table to identify the logged-in user.

## Plan of Work

1. Backend scaffold in `api/`:
   - Create a Maven Spring Boot project using Java 21 source/target compatibility.
   - Add dependencies for Spring Web, Spring Validation, Spring Data JDBC, Spring Security Crypto, Flyway, PostgreSQL, H2 test/runtime fallback, and Spring Boot tests.
   - Add `src/main/resources/db/migration/V1__create_auth_tables.sql` with `users` and `user_sessions` tables. `users` stores email, display name, and BCrypt password hash. `user_sessions` stores opaque tokens with creation and expiry timestamps.
   - Add `V2__seed_demo_user.sql` for a deterministic demo learner account.
   - Implement `/api/auth/login` accepting `{ "email": "...", "password": "..." }` and returning `{ "token": "...", "user": { "id": ..., "email": ..., "displayName": ... } }`.
   - Implement `/api/auth/me` requiring `Authorization: Bearer <token>` and returning the current user.
   - Add CORS for the Angular dev server.
   - Add integration tests for successful login, failed login, and token-authenticated current-user lookup.

2. Frontend scaffold in `app/`:
   - Create an Angular application with routing and stylesheet support.
   - Add Tailwind and SpartanUI support. Use copied lightweight UI primitives/components in the codebase where practical so the first screens visibly use the design system.
   - Build routes for `/` public homepage, `/login`, and `/home` logged-in homepage.
   - Add an auth service that calls the backend login API, stores the opaque token in `localStorage`, and calls `/api/auth/me` to restore the user.
   - Add a route guard that redirects unauthenticated users from `/home` to `/login`.
   - Add component tests for login behavior and route/home rendering.

3. One-command local run:
   - Add a root `docker-compose.yml` that starts Postgres, the Spring Boot API, and the Angular dev server from local source.
   - Add root documentation in `README.md` explaining prerequisites, `docker compose up --build`, demo credentials, and direct test commands.
   - Update `api/README.md` and `app/README.md` with backend/frontend-specific commands.

4. Validate:
   - Run `mvn test` from `api/`.
   - Run `npm test -- --watch=false` or the configured Angular test command from `app/`.
   - Run frontend build/lint if configured.
   - Update this ExecPlan with actual progress, discoveries, decisions, and outcomes.

## Concrete Steps

From `/workspace/qwizle`:

1. Create files and scaffolds using deterministic shell commands and checked-in source files.
2. Run backend checks:

    cd api
    mvn test

   Expected result: Maven exits with status 0 and reports all backend tests passing.

3. Run frontend checks:

    cd app
    npm test -- --watch=false --browsers=ChromeHeadless
    npm run build

   Expected result: npm exits with status 0 for both commands.

4. Start the full stack:

    docker compose up --build

   Expected result: Postgres listens on port 5432, backend listens on port 8080, and Angular listens on port 4200. Visiting `http://localhost:4200` shows the public Qwizle homepage.

## Validation and Acceptance

Acceptance criteria:

- Visiting `/` shows a public Qwizle homepage with a call to start a daily learning routine.
- Visiting `/login` shows a login form.
- Submitting `learner@qwizle.test` and `qwizle123` to the login form succeeds and redirects to `/home`.
- Visiting `/home` after login shows the logged-in learner's display name and a first daily challenge placeholder.
- Calling `POST /api/auth/login` with the demo credentials returns HTTP 200, an opaque token, and user profile JSON.
- Calling `GET /api/auth/me` with `Authorization: Bearer <token>` returns the same user profile.
- Calling `POST /api/auth/login` with a wrong password returns HTTP 401.
- Backend and frontend tests pass.

## Idempotence and Recovery

All generated source files are safe to edit and rerun through tests. Flyway migration files are immutable once committed; if the schema must change after commit, create a new migration rather than editing an applied migration. During this initial uncommitted implementation, migrations may be edited until tests pass. If `docker compose up --build` leaves containers running, stop them with `docker compose down`. To reset local database state, run `docker compose down -v` to remove the Postgres volume.

## Artifacts and Notes

Validation artifacts:

- `mvn test` from `api/` could not resolve dependencies because Maven Central returned HTTP 403 for the Spring Boot parent POM.
- `npm install` from `app/` could not resolve dependencies because the npm registry returned HTTP 403 for Angular packages.
- `git diff --check` passed, confirming the patch has no whitespace errors.

The initial research note is that SpartanUI official documentation describes installing `@spartan-ng/cli`, running `ng g @spartan-ng/cli:init`, and adding UI components through `ng g @spartan-ng/cli:ui`; it also describes Spartan as accessible Angular components with Tailwind CSS styling.

## Interfaces and Dependencies

Backend interfaces to exist at completion:

- `POST /api/auth/login`
  - Request body: `LoginRequest(String email, String password)`.
  - Success response: `LoginResponse(String token, UserProfile user)`.
  - Failure response: HTTP 401 with an error message.
- `GET /api/auth/me`
  - Request header: `Authorization: Bearer <token>`.
  - Success response: `UserProfile(Long id, String email, String displayName)`.
  - Failure response: HTTP 401.

Database tables to exist at completion:

- `users`: `id`, `email`, `display_name`, `password_hash`, `created_at`, `updated_at`.
- `user_sessions`: `id`, `user_id`, `token_hash`, `created_at`, `expires_at`.

Frontend interfaces to exist at completion:

- `AuthService.login(email: string, password: string): Observable<UserProfile>` stores the returned token and user.
- `AuthService.loadCurrentUser(): Observable<UserProfile>` calls `/api/auth/me` using the stored token.
- Routes: `/`, `/login`, `/home`.

Revision note: Initial ExecPlan created before implementation to satisfy harness-first and living-plan requirements.
```

Revision note: Updated after implementation to record completed backend/frontend scaffolds, documentation, local run workflow, and dependency registry limitations discovered during validation.
