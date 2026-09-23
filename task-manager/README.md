# POC 1 — Task Manager (Angular CRUD Foundation)

A small Angular app for managing a task list. It covers the basics of modern frontend development: components, forms, a service for state, and full CRUD (create, read, update, delete). Data is stored in the browser's localStorage; there is no backend or external API.

The original brief is in [POC-1_CRUD_Application_Foundation.md](../POC-1_CRUD_Application_Foundation.md).

## Features

- **Add** a task with a title (required, max 100 characters) and an optional description (max 500 characters).
- **Edit** a task: click **Edit** and the task loads into the form. Save or cancel from there.
- **Delete** a task (with a confirmation prompt).
- **Mark as complete**: use the checkbox or the **Complete** button. Click **Undo** to set it back to "to do".
- **Filter** the list by All / To do / Done, with a count for each.
- **Persistence**: tasks are saved to localStorage, so they survive a page reload.

## Prerequisites

- [Node.js](https://nodejs.org/) 22.22.3+, 24.15+ or 26+, as required by Angular 22 (developed with Node 24.19)
- npm (comes with Node.js)

You don't need the Angular CLI installed globally; the project uses its own copy through npm scripts.

## Running the app

```bash
cd task-manager
npm install      # first time only
npm start
```

Open http://localhost:4200 in your browser. The page reloads automatically when you change a source file. Press `Ctrl+C` in the terminal to stop the server.

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

Run these from the `task-manager/` folder.

| Command | What it does |
|---|---|
| `npm test` | Runs the unit tests (Vitest) in watch mode |
| `npm test -- --watch=false` | Runs the tests once and exits |
| `npm run build` | Creates a production build in `dist/task-manager/` |

## Project structure

```
task-manager/src/app/
├── models/
│   └── task.model.ts          # Task, TaskInput, TaskStatus, TaskFilter types
├── services/
│   ├── task.service.ts        # State, CRUD methods, localStorage persistence
│   └── task.service.spec.ts
├── components/
│   ├── task-form/             # Add / edit form (reactive forms)
│   ├── task-list/             # Renders the filtered list of tasks
│   ├── task-item/             # One task, with Complete / Edit / Delete buttons
│   └── task-filter/           # All / To do / Done filter buttons
├── app.ts / app.html          # Root component: page layout
└── app.config.ts
```

## How it works

**`TaskService` is the single source of truth.** It holds three pieces of state as Angular signals:

- the list of tasks
- the ID of the task being edited, if any
- the active filter

Components read this state through read-only signals and change it only by calling service methods: `add`, `update`, `delete`, `toggleStatus`, `startEditing`, `cancelEditing` and `setFilter`. Every time the task list changes, the service saves it to localStorage under the key `poc1.tasks`.

**Components**

- `TaskForm` handles both adding and editing. When the service reports a task being edited, the form fills in that task's values and switches its heading and button to "Edit task" / "Save changes".
- `TaskList` reads the filtered tasks from the service and renders one `TaskItem` per task.
- `TaskItem` is purely presentational. It receives a task through `input()` and reports clicks to its parent through `output()` events; it never talks to the service directly.
- `TaskFilter` shows the filter buttons and their counts.

**Angular features used**

- standalone components (no NgModules)
- signals (`signal`, `computed`, `effect`) for state
- signal-based `input()` / `output()`
- reactive forms with validators
- the built-in control flow syntax: `@if`, `@for`, `@switch`

## Tests

- `task.service.spec.ts` covers adding, editing, toggling status, deleting, filtering and counts, and saving to and reloading from localStorage.
- `app.spec.ts` checks that the page renders, and adds a task through the form to confirm it appears in the list.

## Resetting data

To clear all tasks, open the browser's developer tools and run:

```js
localStorage.removeItem('poc1.tasks');
```

Then reload the page.
