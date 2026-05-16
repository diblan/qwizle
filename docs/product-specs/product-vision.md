# Product Vision

Qwizle is an app for learning and long-term retention. It should feel like a daily brain-sharpening routine: a small, repeatable challenge loop with the cadence of Wordle-like daily play and the habit-building energy of Duolingo-like practice.

The product should help learners return regularly, answer recall-based questions, and build durable memory over time. The first versions should stay simple, concrete, and easy to verify in the running app.

## Current Product Slice

The current runnable slice is a login-enabled learning shell. A learner can open the Angular frontend, visit a public homepage, log in with the seeded demo account, and land on a guarded learner homepage.

The backend exposes a Spring Boot REST API for authentication, question creation, question attempts, quiz creation, and quiz listing. Flyway owns the database schema for users, sessions, questions, attempts, quizzes, and quiz-question ordering. Postgres is used by the Docker Compose stack, while the backend can use H2 for quick local development without Docker.

The frontend includes:

- Public homepage at `/`.
- Login page at `/login`.
- Logged-in learner home at `/home`.
- Unified question creation and practice UI for single-answer, multiple-answer, multiple-choice, and match questions.

The backend includes:

- `POST /api/auth/login`.
- `GET /api/auth/me`.
- Authenticated question endpoints under `/api/questions`.
- Authenticated quiz endpoints under `/api/quizzes`.

The one-command local run is:

```sh
docker compose up --build
```

The demo learner is `learner@qwizle.test` with password `qwizle123`.

## Non-Goals For Now

Qwizle should not include detailed learner track record dashboards yet.

Qwizle should not include weighted question reappearance logic yet.

Difficulty can evolve over time, and previously failed content can reappear in future iterations, but advanced progression logic should wait until these non-goals are explicitly promoted.
