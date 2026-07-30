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

The selected architecture separates the application into the following layers:

1. **Presentation layer:** Next.js App Router pages and components render the user interface.
2. **REST interface:** Next.js Route Handlers will expose REST endpoints only for operations on task resources that require them.
3. **Task service:** The service will apply input validation and application rules.
4. **Task repository:** The repository will contain the SQLite queries and persistence operations.
5. **Persistence:** SQLite will store task data locally through `better-sqlite3`.

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

The Next.js JavaScript project scaffold, dependency configuration, SQLite schema, and placeholder files for the database, repository, rules, and service layers are present. The page still contains the default Next.js starter interface. The layer files are empty, SQLite is not yet connected to the application, and the required task UI, task operations, sorting, archival view, and REST Route Handlers have not yet been implemented.

There is currently no `test` script or implemented automated test command in `package.json`.

## AI usage declaration

`ChatGPT work 5.6 Sol High` was used to inspect the repository and assist with drafting this project documentation. The resulting documentation was checked against the current repository structure, `package.json`, and `database/schema.sql`.
