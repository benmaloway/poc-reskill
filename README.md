# Angular Reskilling POCs

A series of small Angular proof-of-concept apps, each one building on the skills from the one before. Every POC is its own Angular 22 project with its own `package.json`, and each has a detailed README.

| POC | Folder | What it covers | Brief |
|---|---|---|---|
| 1 — Task Manager | [task-manager/](task-manager/README.md) | Components, reactive forms, a service for state, full CRUD with localStorage | [brief](POC-1_CRUD_Application_Foundation.md) |
| 2 — User Catalogue | [user-catalogue/](user-catalogue/README.md) | `HttpClient`, RxJS Observables, API/state layer split, loading and error handling | [brief](POC-2_API_Connected_Application_User_Catalogue) |

## Prerequisites

- [Node.js](https://nodejs.org/) 22.22.3+, 24.15+ or 26+, as required by Angular 22 (developed with Node 24.19)
- npm (comes with Node.js)
- An internet connection for POC 2, which calls the public [JSONPlaceholder](https://jsonplaceholder.typicode.com) API

You don't need the Angular CLI installed globally; each project uses its own copy through npm scripts.

## Running an app

Each POC is installed and run separately from its own folder:

```bash
# POC 1
cd task-manager
npm install      # first time only
npm start

# POC 2
cd user-catalogue
npm install      # first time only
npm start
```

Open http://localhost:4200 in your browser. Press `Ctrl+C` in the terminal to stop the server.

### Running both at the same time

Both apps use port 4200 by default. To run a second one alongside the first, give it another port:

```bash
cd user-catalogue
npm start -- --port 4201
```

## Stopping the server

Angular has no separate stop command (there is no `ng stop`). `npm start` runs `ng serve`, and that one process is both the development server and the app: the app only exists while `ng serve` is running, so stopping the server stops the app.

If the server is running in your terminal, press `Ctrl+C` in that terminal.

If it was started somewhere you can't reach (another terminal, a closed window or a background task), stop whatever is listening on the port:

```bash
lsof -ti tcp:4200 -sTCP:LISTEN | xargs kill
```

Change `4200` to the port you used, for example `4201`. To check what is on the port before stopping it, run `lsof -i tcp:4200 -sTCP:LISTEN`. If nothing is printed, no server is running there.

A few things to know:

- **Process names**: `lsof` lists the server as `node`, and `ps` shows it as `ng serve (<project-name>)`, started by an `npm start` parent process. Stopping `ng serve` also ends `npm start`.
- **Open browser tabs**: a tab keeps showing the last page it loaded after the server stops. Reloading it gives a "can't connect" error, which confirms the server is down.
- **Exit code 143**: if the server was stopped with `kill`, it exits with code 143 (it received a stop signal, SIGTERM). This is expected and doesn't mean it crashed.

## Other commands

Run these from inside a project folder.

| Command | What it does |
|---|---|
| `npm test` | Runs the unit tests (Vitest) in watch mode |
| `npm test -- --watch=false` | Runs the tests once and exits |
| `npm run build` | Creates a production build in `dist/<project-name>/` |

## Troubleshooting

- **`Port 4200 is already in use`**: another app (often the other POC) is still running. Stop it (see [Stopping the server](#stopping-the-server)), or start this one on another port as shown above.
- **Errors after pulling changes or switching Node versions**: delete `node_modules` in that project and run `npm install` again.
- **POC 2 shows "Can't reach the server"**: check your internet connection, and make sure the **Simulate API down** checkbox in the header is unticked.
- **POC 1 shows old tasks**: tasks live in localStorage. See [Resetting data](task-manager/README.md#resetting-data).
