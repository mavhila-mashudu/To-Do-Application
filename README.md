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

These are project requirements, not a claim that the current scaffold already implements them.

## Architecture

The project uses a lightweight layered architecture:

1. **Presentation layer:** Next.js App Router pages and components will render the task interface.
2. **REST interface:** Next.js Route Handlers will expose REST endpoints only for operations on task resources that require them.
3. **Task service:** The service will apply input validation and application rules.
4. **Task repository:** The implemented repository contains SQLite queries and persistence operations for creating, finding, editing, archiving, filtering, and sorting tasks.
5. **Persistence:** The implemented database module initializes the existing SQLite schema and provides a shared local connection through `better-sqlite3`.

A separate Express server is unnecessary. Next.js can serve the presentation layer and provide the required REST interface through Route Handlers in the same application, avoiding another server process and a duplicate HTTP stack.

REST endpoints are planned for task create, read, update, and delete operations. No Route Handler files currently exist, so these endpoints are not yet implemented. In this application, user-facing "deletion" is expected to be archival rather than removal of the stored task.

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

No REST Route Handlers exist, and the page still contains the default Next.js starter interface. The REST API and task user interface are therefore not implemented, and the application is not complete.

There is currently no `test` script or implemented automated test command in `package.json`.

## AI usage declaration

`ChatGPT work 5.6 Sol High` in Codex was used to inspect the repository, generate the SQLite task repository code, design its in-memory verification, and assist with this documentation. The generated work was reviewed and verified against the current repository, `package.json`, and `database/schema.sql`.
