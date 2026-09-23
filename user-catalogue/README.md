# POC 2 — User Catalogue (API-Connected Angular App)

An Angular app that loads users from a public REST API and displays them. It covers the basics of API-driven frontend development: `HttpClient`, RxJS Observables, a clear split between the API layer and the state layer, and loading and error handling. It uses the free [JSONPlaceholder](https://jsonplaceholder.typicode.com) API.

The original brief is in [../POC-2_API_Connected_Application_User_Catalogue](../POC-2_API_Connected_Application_User_Catalogue).

## Features

- **User list**: shows each user's name, email and city, fetched with `GET /users`.
- **Search**: filters the list by name, email or city as you type.
- **Refresh**: re-fetches the list. The button is disabled while a request is in flight.
- **User detail page** (`/users/:id`): phone, website, address and company. Unknown IDs show a "does not exist" message.
- **Add user**: a form that sends `POST /users`. JSONPlaceholder accepts the request but does not store data, so new users are kept in memory, marked **new**, and disappear on reload.
- **Error handling**: network failures, timeouts (10 s) and server errors show a clear message with a **Try again** button. If a refresh fails, the last list stays on screen.
- **Automatic retry**: failed GETs are retried once after 500 ms if the error is temporary (network, timeout, 5xx). A 404 is not retried, and POSTs are never retried, to avoid creating duplicates.
- **Simulate API down**: a checkbox in the header makes every request fail, so you can see the error handling without disconnecting from the network.

## Prerequisites

- [Node.js](https://nodejs.org/) 22.22.3+, 24.15+ or 26+, as required by Angular 22 (developed with Node 24.19)
- npm (comes with Node.js)
- An internet connection (the app calls a public API)

## Running the app

```bash
cd user-catalogue
npm install      # first time only
npm start
```

Open http://localhost:4200 in your browser. Press `Ctrl+C` in the terminal to stop the server.

If port 4200 is already in use (for example, by the POC 1 task manager), run `npm start -- --port 4201` instead.

To see the error handling, tick **Simulate API down** in the header and click **Refresh**, or open a user's detail page.

## Other commands

Run these from the `user-catalogue/` folder.

| Command | What it does |
|---|---|
| `npm test` | Runs the unit tests (Vitest) in watch mode |
| `npm test -- --watch=false` | Runs the tests once and exits |
| `npm run build` | Creates a production build in `dist/user-catalogue/` |

## Project structure

```
user-catalogue/src/app/
├── models/
│   └── user.model.ts            # ApiUser (API shape), User (app shape), NewUser (form)
├── core/
│   ├── api.config.ts            # API_BASE_URL injection token, request timeout
│   ├── http-error.ts            # Turns HTTP errors into user-facing messages; retry rules
│   └── outage-simulator.ts      # "Simulate API down" toggle + HTTP interceptor
├── services/
│   ├── user-api.service.ts      # API layer: HTTP calls, timeout, retry, mapping
│   └── user.service.ts          # State layer: user list, loading, error, refresh
├── components/
│   ├── user-table/              # Table of users (presentational)
│   ├── error-message/           # Error box with optional "Try again" (presentational)
│   └── loading-indicator/       # Spinner + label
├── pages/
│   ├── user-list/               # Route "/": search, refresh, list
│   ├── user-detail/             # Route "/users/:id"
│   └── user-form/               # Route "/users/new": add user (POST)
├── testing/api-users.ts         # Test data factory
├── app.routes.ts
└── app.config.ts                # provideHttpClient, router, interceptor
```

## How it works

Data flows in one direction: **API → `UserApiService` → `UserService` → components**.

**`UserApiService` (API layer)** is the only code that knows the API's URLs and response format. Each method returns a cold Observable: nothing is sent until someone subscribes. It adds a timeout and a single retry for temporary errors, then maps the nested API response (`address.city`, `company.name`, …) to the flat `User` model the rest of the app uses. If the API changed, this is the only file that would need to change.

**`UserService` (state layer)** holds the user list, the loading flag and the last error as signals. Clicking **Refresh** pushes a value into a `Subject`; a `switchMap` turns that into an API call and cancels any earlier call still in flight. `catchError` turns a failure into an error message instead of breaking the stream, so later refreshes still work. `getUser(id)` returns the cached user when the list is already loaded, and otherwise calls the API.

**Components** never call `HttpClient` directly.

- `UserList` calls `load()` on init (it fetches only the first time) and `refresh()` from the button.
- `UserDetail` receives the route's `:id` as a signal input, converts it to an Observable, and uses `switchMap` to fetch the user whenever the ID changes or **Try again** is clicked. The result becomes a `loading` / `loaded` / `not-found` / `error` state that the template switches on.
- `UserForm` uses reactive forms with validators, subscribes to `create()`, and uses `finalize` to clear the "Saving…" state whether the request succeeds or fails.
- `UserTable` and `ErrorMessage` are presentational: they get data through `input()` and report clicks through `output()`.

**Angular and RxJS features used**

- `HttpClient` with `provideHttpClient(withFetch(), withInterceptors(...))`
- a functional HTTP interceptor
- an `InjectionToken` for the API base URL
- RxJS: `Subject`, `BehaviorSubject`, `switchMap`, `map`, `catchError`, `retry`, `timeout`, `startWith`, `finalize`, `combineLatest`
- `toSignal` / `toObservable` to move between signals and Observables
- router with `withComponentInputBinding()` (route parameters as component inputs)
- standalone components, signals, and the built-in control flow syntax (`@if`, `@for`)

## Tests

Tests use `HttpTestingController`, so they never call the real API.

- `user-api.service.spec.ts`: URLs and HTTP methods, response mapping, one retry after a network error, no retry on 404, POST body.
- `user.service.spec.ts`: loading and error state, `load()` vs `refresh()`, keeping the last list when a refresh fails, the cache in `getUser`, unique IDs for created users.
- `http-error.spec.ts`: error messages and retry rules.
- `app.spec.ts`: the list renders name, email and city; the "API down" error and **Try again** work; the detail page shows a user, or "does not exist" for an unknown ID.
