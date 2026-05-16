# Reliability

Reliability in Qwizle means a future agent or human can run, test, and reason about the app from checked-in files.

## One-Command Local Run

From the repository root:

```sh
docker compose up --build
```

Then open `http://localhost:4200`.

The stack exposes:

- Angular frontend: `http://localhost:4200`.
- Spring Boot API: `http://localhost:8080`.
- Postgres: `localhost:5432` with database, username, and password `qwizle`.

Stop the stack with:

```sh
docker compose down
```

Reset local database data with:

```sh
docker compose down -v
```

## Backend Checks

From `api/`:

```sh
mvn test
```

For quick local backend development without Docker, the default profile uses a local H2 database file:

```sh
mvn spring-boot:run
```

To run the backend against Postgres, set:

```sh
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/qwizle
export SPRING_DATASOURCE_USERNAME=qwizle
export SPRING_DATASOURCE_PASSWORD=qwizle
export SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
mvn spring-boot:run
```

Flyway owns schema changes. Once a migration has been applied in a shared environment, create a new migration instead of editing the old one.

## Frontend Checks

From `app/`:

```sh
npm install
npm run check:deps
npm run lint
npm test
npm run build
```

The frontend expects the API at `http://localhost:8080/api`.

## Documentation Reliability

When workflows change, update the docs that describe them. At minimum, local run changes should update `README.md` and this file. Frontend workflow changes should update `FRONTEND.md` and `app/README.md`. Backend workflow changes should update `api/README.md`.

## Known Environment Caveats

The first full-stack ExecPlan recorded an environment where Maven Central and the npm registry returned HTTP 403 while resolving dependencies. If that no longer occurs in the current environment, remove or revise the caveat in the relevant plan or follow-up notes.
