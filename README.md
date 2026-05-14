# Qwizle

Qwizle is a daily learning and long-term retention app. This first full-stack slice includes a public homepage, a login page, a logged-in learner homepage, a Spring Boot authentication API, and Flyway-managed user/session tables.

## Local one-command run

Prerequisites:

- Docker and Docker Compose

Start everything from the repository root:

```sh
docker compose up --build
```

Then open <http://localhost:4200>.

Demo credentials:

- Email: `learner@qwizle.test`
- Password: `qwizle123`

The stack exposes:

- Angular frontend: <http://localhost:4200>
- Spring Boot API: <http://localhost:8080>
- Postgres: `localhost:5432` with database/user/password `qwizle`

Stop the stack:

```sh
docker compose down
```

Reset local database data:

```sh
docker compose down -v
```

## REST API quick checks

Log in:

```sh
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"learner@qwizle.test","password":"qwizle123"}'
```

Use the returned token with `/api/auth/me`:

```sh
curl -s http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## Development checks

Backend:

```sh
cd api
mvn test
```

Frontend:

```sh
cd app
npm install
npm test
npm run build
```

## ExecPlan

The implementation plan is checked in at `docs/exec-plans/0001-first-full-stack-login.md` and was kept updated while this first slice was built.
