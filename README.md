# Qwizle

Qwizle is a daily learning and long-term retention app. This first full-stack slice includes a public homepage, a login page, a logged-in learner homepage, a Spring Boot authentication API, logged-in one-answer and fixed-size set question creation/attempts, quiz creation from existing questions, and Flyway-managed user/session/question tables.

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

Create a basic one-answer question (requires the returned bearer token):

```sh
curl -s -X POST http://localhost:8080/api/questions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <token>" \
  -d '{"question":"What does spaced repetition support?","answer":"Long-term retention"}'
```


Create a fixed-size set question, such as naming all OSI model layers. The number of accepted answers defines the number learners must submit, and attempts can provide the answers in any order. Each answer must be supplied as its own array element; individual set-answer values cannot contain line breaks:

```sh
curl -s -X POST http://localhost:8080/api/questions \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <token>" \
  -d '{"question":"Name the layers of the OSI model.","type":"SET_ANSWER","answers":["Physical","Data Link","Network","Transport","Session","Presentation","Application"]}'
```

List available questions (answers are intentionally hidden):

```sh
curl -s http://localhost:8080/api/questions \
  -H "Authorization: Bearer <token>"
```

Create a quiz from existing questions. For an OSI model quiz, create the TCP layer question and OSI layer set question first, then pass their returned IDs in the desired order:

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
  -d '{"answer":"Long-term retention"}'
```

Attempt a set question:

```sh
curl -s -X POST http://localhost:8080/api/questions/<question-id>/attempts \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <token>" \
  -d '{"answers":["Application","Presentation","Session","Transport","Network","Data Link","Physical"]}'
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
