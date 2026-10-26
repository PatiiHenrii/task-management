# Task Management Frontend

Angular 17 standalone frontend for the Task Management API.

## Run locally

Install Node.js 18.13+ and npm, then run from this directory:

```bash
npm install
npm start
```

The development server starts at `http://localhost:4200`. Its proxy forwards `/api` requests to `http://localhost:8080`, avoiding browser CORS checks during local development. Set the backend's `CORS_ALLOWED_ORIGINS` environment variable to the deployed frontend origin(s), separated by commas, when calling the API directly from a browser in another environment.

## Structure

```text
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── features/
│   ├── auth/
│   └── tasks/
└── shared/
    └── components/
```

Angular Material 17 is listed in `package.json`; the global Material light theme is configured in `src/styles.scss`. Routes are declared in `src/app/app-routing.module.ts`; `/tasks` is protected by the functional auth guard. Login and account registration use the backend endpoints at `/api/auth/login` and `/api/auth/register`.
