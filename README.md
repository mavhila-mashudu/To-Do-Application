# COMS3011A Lab 1 Todo Application

This project is a local-first, single-user todo application. It is intended to keep one user's task data on the local machine and preserve that information between application restarts.

## Technology

The project currently uses:

- Next.js 16 App Router
- JavaScript
- Node.js
- npm
- SQLite
- `better-sqlite3`
- React and React DOM

The Node.js version used for this project is exactly `v22.20.0`.

## Functional requirements

The application is required to:

- Create and edit tasks.
- Archive tasks without deleting them.
- View archived tasks.
- Sort tasks by topic, status, and due date.
- Use only the statuses `Todo`, `In-Progress`, and `Complete`.
- Display whether a task is overdue separately from its status.
- Preserve task information after the application is restarted.

The current implementation supports these requirements through the task dashboard, REST API, service, repository, and SQLite persistence layer.

## Architecture

The project uses a lightweight layered architecture:

1. **Presentation layer:** Next.js App Router pages and components render the task interface.
2. **REST interface:** Next.js Route Handlers expose REST endpoints only for operations on task resources that require them.
3. **Task service:** The implemented service applies input validation and application rules.
4. **Task repository:** The implemented repository contains SQLite queries and persistence operations for creating, finding, editing, archiving, filtering, and sorting tasks.
5. **Persistence:** The implemented database module initializes the existing SQLite schema and provides a shared local connection through `better-sqlite3`.

A separate Express server is unnecessary. Next.js can serve the presentation layer and provide the required REST interface through Route Handlers in the same application, avoiding another server process and a duplicate HTTP stack.

REST endpoints are implemented for task creation, retrieval, editing, listing, sorting, and archival. User-facing removal is archival rather than deletion, so tasks remain stored and available from the Archived page.

## Installation and running

From the repository's `todo` directory, install the locked dependency versions:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

To run a production build locally:

```bash
npm run build
npm start
```

## Development status

SQLite initialization and the task repository are implemented. The repository supports task creation, lookup, editing, archival, active and archived queries, and sorting by topic, status, or due date. Archiving preserves tasks instead of deleting them.

The task rules and service are implemented and integrated with the repository. They validate task IDs and inputs, enforce the supported status and sorting values, and add derived overdue information without storing overdue in SQLite.

The REST Route Handlers and responsive task interface are implemented. The dashboard loads persisted active tasks, shows statistics and derived overdue indicators, sorts by due date, status, or topic, and supports creating, editing, and archiving tasks. Archived tasks remain available on the Archived page. The UI includes loading, empty, success, error, keyboard-focus, and mobile layout states.

There is currently no `test` script or implemented automated test command in `package.json`.

## AI usage declaration

`ChatGPT work 5.6 Sol High` in Codex was used to inspect the repository, generate the SQLite task repository code, design its in-memory verification, recreate the task interface from the supplied reference, and assist with this documentation. The generated work was reviewed and verified against the current repository, `package.json`, and `database/schema.sql`.
