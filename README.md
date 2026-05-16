# Qwizle

Qwizle is a daily learning and long-term retention app. This first full-stack slice includes a public homepage, a login page, a logged-in learner homepage, a Spring Boot authentication API, unified question creation/attempts, quiz creation from existing questions, and Flyway-managed user/session/question tables.

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

Create a single-answer question (requires the returned bearer token):

```sh
curl -s -X POST http://localhost:8080/api/questions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"SINGLE_ANSWER","prompt":{"text":"What does spaced repetition support?"},"definition":{"acceptedAnswers":[{"text":"Long-term retention"}]}}'
```


Create a required-set multiple-answer question, such as naming all OSI model layers. The number of configured answers defines the number learners must submit, and attempts can provide the answers in any order:

```sh
curl -s -X POST http://localhost:8080/api/questions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"MULTIPLE_ANSWER","prompt":{"text":"Name the layers of the OSI model."},"definition":{"mode":"REQUIRED_SET","answers":[{"id":"physical","text":"Physical"},{"id":"data-link","text":"Data Link"},{"id":"network","text":"Network"},{"id":"transport","text":"Transport"},{"id":"session","text":"Session"},{"id":"presentation","text":"Presentation"},{"id":"application","text":"Application"}]}}'
```

List available questions (answers are intentionally hidden):

```sh
curl -s http://localhost:8080/api/questions \
  -H "Authorization: Bearer <token>"
```

Create a quiz from existing questions. For an OSI model quiz, create the TCP layer question and OSI layer question first, then pass their returned IDs in the desired order:

```sh
curl -s -X POST http://localhost:8080/api/quizzes \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"OSI model basics","description":"TCP placement and all seven layers.","questionIds":[<tcp-question-id>,<layers-question-id>]}'
```

List available quizzes with their ordered questions (answers are intentionally hidden):

```sh
curl -s http://localhost:8080/api/quizzes \
  -H "Authorization: Bearer <token>"
```

Attempt a one-answer question:

```sh
curl -s -X POST http://localhost:8080/api/questions/<question-id>/attempts \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"SINGLE_ANSWER","response":{"text":"Long-term retention"}}'
```

Attempt a multiple-answer question:

```sh
curl -s -X POST http://localhost:8080/api/questions/<question-id>/attempts \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"MULTIPLE_ANSWER","response":{"answers":["Application","Presentation","Session","Transport","Network","Data Link","Physical"]}}'
```

The current supported question types are `SINGLE_ANSWER`, `MULTIPLE_ANSWER`, `MULTIPLE_CHOICE`, and `MATCH`. The early prototype question tables were replaced by a clean unified schema; reset local prototype data with `docker compose down -v` or by deleting the local H2 data file before running this version.

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
