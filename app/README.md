# Frontend (`/app`)

Angular frontend for Qwizle using Bootstrap classes and light component SCSS. The app does not use Spartan UI or Angular Material.

## Screens

- `/` public homepage
- `/login` standalone login page with a responsive Bootstrap form
- `/home` logged-in learner homepage guarded by local auth state, including unified question creation/practice for single-answer, multiple-answer, multiple-choice, and match questions

## Run locally without Docker

```sh
npm install
npm start
```

The app loads runtime configuration from `public/qwizle-config.json` before Angular bootstraps. By default, that file points the browser at `http://localhost:8080/api`.

For a different API host, change `public/qwizle-config.json` or generate it with:

```sh
QWIZLE_API_BASE_URL=https://api.example.com/api npm run write:config
```

The browser calls the API directly. Cross-origin access is handled by backend CORS configuration, not by the Angular dev server.

## Test and build

```sh
npm run check:deps
npm run lint
npm test
npm run build
```

`npm run check:deps` verifies that Angular runtime packages stay on the same Angular major.

Demo credentials are `learner@qwizle.test` / `qwizle123`.
