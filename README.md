# COMS3011A Lab 1 Todo Application

## Overview

This is a local-first, single-user todo application built with Next.js and SQLite. It runs on the user's machine, stores tasks in a local database, and preserves them between restarts.

## Implemented features

- Create and edit tasks with a title, description, due date, topic and fixed status.
- Use only `Todo`, `In-Progress` and `Complete` as statuses.
- Display overdue as a derived indicator, not as a status.
- Sort active tasks by due date, status or topic.
- Archive tasks without deleting them and view them on the Archived page.
- Show active-task statistics, loading and empty states, validation feedback, and success or error messages.
- Support responsive layouts and keyboard-accessible forms and dialogs.
- Persist task information in SQLite after the application restarts.

## Requirements

- Node.js `v22.20.0`
- npm
- A local filesystem location in which the application can create its `data/` directory and SQLite database

## Clean installation and running

From the repository root, which contains `package.json`:

```powershell
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On the first task API request, the application automatically creates `data/` and `data/tasks.db` if needed, reads `database/schema.sql`, and initializes the `tasks` table. The generated database, WAL and shared-memory files are ignored by Git.

Available commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm test` | Run all Vitest suites once. |
| `npm run lint` | Run ESLint across the project. |
| `npm run build` | Create an optimized production build. |
| `npm start` | Start the production server after `npm run build`. |

For a production run:

```powershell
npm run build
npm start
```

## Architecture and repository structure

The application uses a lightweight layered architecture within one Next.js process; a separate Express server is unnecessary.

```text
app/                    Next.js pages and task Route Handlers
components/             Dashboard, forms, dialogs, task cards and CSS Module
lib/taskService.js      Validation orchestration and derived overdue data
lib/taskRules.js        Status, date, sorting and input rules
lib/taskRepository.js   Parameterized SQLite persistence and row mapping
lib/database.js         Shared SQLite connection and schema initialization
database/schema.sql     Shipped tasks table definition
tests/                  Vitest repository, rules and service suites
docs/                   Database and third-party documentation
data/tasks.db           Generated local database; not tracked by Git
```

The React interface calls Next.js Route Handlers. Route Handlers translate HTTP requests and errors, the service enforces application rules, the repository owns SQL queries, and `better-sqlite3` persists data in SQLite. The shared database connection is cached on `globalThis`, which avoids opening a new connection during Next.js development reloads.

## REST API

Successful responses contain a `data` property. Validation and missing-task responses contain a structured `error` property.

| Method and route | Behaviour |
| --- | --- |
| `GET /api/tasks?archived=false&sortBy=dueDate` | List active tasks. `sortBy` accepts `dueDate`, `status` or `topic`. |
| `GET /api/tasks?archived=true&sortBy=dueDate` | List archived tasks. |
| `POST /api/tasks` | Create a task from `title`, `description`, `dueDate`, `topic` and optional `status`. |
| `GET /api/tasks/[id]` | Retrieve one task. |
| `PATCH /api/tasks/[id]` | Edit one or more allowed task fields. |
| `PATCH /api/tasks/[id]` with `{ "archived": true }` | Archive a task without deleting it. |

There is no delete endpoint.

## Testing

`npm test` runs 10 deterministic tests across three Vitest suites. The tests cover repository persistence and archiving, logical status sorting, input and date validation, overdue calculation, service validation, and missing-task handling. Database tests use isolated `:memory:` SQLite connections and do not depend on `data/tasks.db`.

## AI use declarations

This repository makes use of AI code generation using the following tools: ChatGPT-Web[5.6 Sol High], Codex[5.6 Sol High], and Figma-Make.

This repository does not use AI in-line editing tools.

This repository makes use of AI code review using the following tools: ChatGPT-Web[5.6 Sol High] and Codex[5.6 Sol High].

Figma Make produced the visual UI reference that was recreated as React components and CSS and integrated with the application. Its exact model name was not displayed, so the tool is declared as `Figma-Make` without an invented model name.

The preceding document was reviewed and edited with the assistance of the following: Codex[5.6 Sol High].
