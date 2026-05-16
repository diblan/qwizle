# Qwizle Architecture

This repository is organized as a two-application monorepo:

- `/app` — Angular frontend application.
- `/api` — Spring Boot REST API backend.

## Architectural Invariants

The following rules are required and should be treated as invariants:

1. **Frontend location is fixed:** all Angular frontend code lives under `/app`.
2. **Backend location is fixed:** all Spring Boot backend code lives under `/api`.
3. **No cross-placement of app code:** frontend source files must not be added under `/api`, and backend source files must not be added under `/app`.
4. **Top-level clarity:** new top-level folders should not duplicate frontend/backend responsibilities already owned by `/app` and `/api`.

## Current first-slice runtime

The first runnable product slice is a login-enabled learning shell:

- The Angular app owns the public homepage (`/`), login page (`/login`), and logged-in learner homepage (`/home`), including unified question creation, quiz-building, and practice UI.
- The Spring Boot API owns authentication endpoints under `/api/auth`, authenticated unified question endpoints under `/api/questions`, and quiz endpoints under `/api/quizzes`.
- Flyway owns database schema creation for `users`, `user_sessions`, `questions`, `question_tags`, `question_attempts`, `quizzes`, and `quiz_questions`.
- Postgres is the production-style database used by `docker compose up --build`; the API defaults to an H2 file database only for quick local backend development without Docker.
- The frontend stores the backend's opaque bearer token in browser `localStorage` and sends it to API requests through an Angular HTTP interceptor. Question endpoints also validate the bearer token on the backend before creating, listing, or attempting questions and creating or listing quizzes.

## Rationale

Keeping these boundaries explicit makes the codebase easier to navigate for humans and AI agents, and reduces accidental coupling as both applications grow.
