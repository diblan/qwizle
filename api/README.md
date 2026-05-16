# Backend (`/api`)

Spring Boot REST API for Qwizle.

## What it contains

- Flyway migration `src/main/resources/db/migration/V1__create_auth_tables.sql` for `users` and `user_sessions`.
- Demo user seeding through `DemoUserSeeder`.
- `POST /api/auth/login` for email/password login.
- `GET /api/auth/me` for looking up the logged-in user from an opaque bearer token.
- `POST /api/questions` for unified `SINGLE_ANSWER`, `MULTIPLE_ANSWER`, `MULTIPLE_CHOICE`, and `MATCH` questions.
- `GET /api/questions` and `GET /api/questions/{questionId}` for learner-safe question retrieval without hidden definitions.
- `POST /api/questions/{questionId}/attempts` for scoring canonical typed submissions.
- `POST /api/quizzes` and `GET /api/quizzes` for quizzes assembled from existing questions.

Question definitions and submissions use type-specific JSON payloads validated by backend handlers. The early `basic_questions` prototype schema has been replaced by the canonical `questions` and `question_attempts` tables; reset local prototype databases before running this version.

## Run locally without Docker

The default profile uses a local H2 database file so the API can run without Postgres during quick development:

```sh
mvn spring-boot:run
```

Local browser clients are allowed by default from `http://localhost:*`, `http://127.0.0.1:*`, and `http://[::1]:*`. Override this with `QWIZLE_CORS_ALLOWED_ORIGIN_PATTERNS` when a different frontend origin needs API access, for example `https://app.example.com`.

For Postgres, set these environment variables before starting:

```sh
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/qwizle
export SPRING_DATASOURCE_USERNAME=qwizle
export SPRING_DATASOURCE_PASSWORD=qwizle
export SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
mvn spring-boot:run
```

## Test

```sh
mvn test
```

Demo credentials are `learner@qwizle.test` / `qwizle123`.
