# Frontend (`/app`)

Angular frontend for Qwizle using Bootstrap classes and light component SCSS. The app does not use Spartan UI or Angular Material.

## Screens

- `/` public homepage
- `/login` standalone login page with a responsive Bootstrap form
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
npm run lint
npm test
npm run build
```

`npm run check:deps` verifies that Angular runtime packages stay on the same Angular major.

Demo credentials are `learner@qwizle.test` / `qwizle123`.
