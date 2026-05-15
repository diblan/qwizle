# Frontend (`/app`)

Angular frontend for Qwizle using Tailwind CSS and SpartanUI-style UI building blocks. SpartanUI is represented by the checked-in Tailwind-based component classes and package dependencies for `@spartan-ng/brain` and `@spartan-ng/cli`, matching Spartan's accessible primitive plus customizable styles model.

## Screens

- `/` public homepage
- `/login` login form
- `/home` logged-in learner homepage guarded by local auth state, including one-answer and fixed-size set question creation/practice

## Run locally without Docker

```sh
npm install
npm start
```

The app expects the API at `http://localhost:8080/api`.

## Test and build

```sh
npm run check:deps
npm test
npm run build
```

`npm run check:deps` verifies that Angular runtime packages, including the explicit `@angular/cdk` dependency required by Spartan primitives, stay on the same Angular major. Keeping `@angular/cdk` on Angular 20 prevents npm from resolving the latest CDK 21 release during `docker compose build` while the rest of the app remains on Angular 20.

Demo credentials are `learner@qwizle.test` / `qwizle123`.
