# Backend (`/api`)

Spring Boot REST API for Qwizle.

## What it contains

- Flyway migration `src/main/resources/db/migration/V1__create_auth_tables.sql` for `users` and `user_sessions`.
- Demo user seeding through `DemoUserSeeder`.
- `POST /api/auth/login` for email/password login.
- `GET /api/auth/me` for looking up the logged-in user from an opaque bearer token.

## Run locally without Docker

The default profile uses a local H2 database file so the API can run without Postgres during quick development:

```sh
mvn spring-boot:run
```

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
