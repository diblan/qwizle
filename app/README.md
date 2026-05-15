# Frontend (`/app`)

Angular frontend for Qwizle using Tailwind CSS and Spartan UI's Brain/Helm-style approach: accessible Brain primitives are composed in Angular templates and styled directly with Tailwind utility classes. The app keeps dependencies on `@spartan-ng/brain` and `@spartan-ng/cli` and does not use Angular Material, Bootstrap, or another component library.

## Screens

- `/` public homepage
- `/login` standalone login page with a responsive Spartan Brain primitive form styled with Tailwind utility classes
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
