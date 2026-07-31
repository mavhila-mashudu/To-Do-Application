# Database design

## Overview

The application stores every active and archived task in one `tasks` table. A single table is sufficient because tasks are the only persisted resource and the application serves one local user. Topic and status are task attributes, so there are no other tables, foreign keys or inter-table relationships.

## `tasks` schema

The table below matches `database/schema.sql`.

| Column | SQLite type | Constraints and default | Purpose |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique task identifier. |
| `title` | `TEXT` | `NOT NULL`; trimmed length must be greater than zero | Required task title. |
| `description` | `TEXT` | `NOT NULL`; trimmed length must be greater than zero | Required task description. |
| `due_date` | `TEXT` | `NOT NULL`; `GLOB` check for `YYYY-MM-DD` digits | Due date in sortable `YYYY-MM-DD` form. The service additionally rejects impossible calendar dates. |
| `topic` | `TEXT` | `NOT NULL`; trimmed length must be greater than zero | Required category used for display and sorting. |
| `status` | `TEXT` | `NOT NULL DEFAULT 'Todo'`; must be `Todo`, `In-Progress` or `Complete` | Fixed workflow state. |
| `archived_at` | `TEXT` | Nullable; `DEFAULT NULL` | Archive timestamp. `NULL` identifies an active task. |
| `created_at` | `TEXT` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | SQLite timestamp assigned when the row is inserted. |
| `updated_at` | `TEXT` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | SQLite timestamp assigned on insertion and explicitly refreshed by repository edits and archiving. |

The fixed status constraint prevents unsupported workflow values and ensures consistent sorting. Overdue is deliberately not a status or database column: the service derives it from `due_date`, the current date and `status`. A past task is overdue only while its status is not `Complete`; deriving it avoids stale stored data.

## Archiving and queries

Archiving sets `archived_at` and `updated_at` to `CURRENT_TIMESTAMP`. It never deletes or moves the row, so task history remains viewable. Active queries use `archived_at IS NULL`; archived queries use `archived_at IS NOT NULL`.

The repository uses parameterized SQL for user values and maps SQLite names such as `due_date` and `archived_at` to JavaScript properties such as `dueDate` and `archivedAt`. It provides deterministic ascending sorting by due date, case-insensitive topic, or the logical status order `Todo`, `In-Progress`, `Complete`, with task ID as a secondary key.

## Database creation and initialization

`lib/database.js` resolves the normal database path as `data/tasks.db` from the process working directory. `createDatabase()` creates the parent directory, opens the database with `better-sqlite3`, enables foreign-key enforcement, enables WAL mode for file-backed databases, reads `database/schema.sql`, and executes the idempotent `CREATE TABLE IF NOT EXISTS` statement.

`getDatabase()` stores one shared connection on `globalThis`, making it suitable for Next.js development reloads. Tests inject `:memory:` connections; these receive the same schema but do not create files or enable WAL mode.

The preceding document was reviewed and edited with the assistance of the following: Codex[5.6 Sol High].
