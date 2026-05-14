# Frontend (`/app`)

Angular frontend for Qwizle using Tailwind CSS and SpartanUI-style UI building blocks. SpartanUI is represented by the checked-in Tailwind-based component classes and package dependencies for `@spartan-ng/brain` and `@spartan-ng/cli`, matching Spartan's accessible primitive plus customizable styles model.

## Screens

- `/` public homepage
- `/login` login form
- `/home` logged-in learner homepage guarded by local auth state

## Run locally without Docker

```sh
npm install
npm start
```

The app expects the API at `http://localhost:8080/api`.

## Test and build

```sh
npm test
npm run build
```

Demo credentials are `learner@qwizle.test` / `qwizle123`.
