# Database design

## Overview

The database currently defines one table, `tasks`. Its purpose is to persist all information needed for a task, including its content, due date, topic, workflow status, archive state, and creation and update timestamps.

A single table is sufficient because the current requirements describe one resource type for one local user. Topics and statuses are task attributes rather than separate managed entities. There are currently no inter-table relationships or foreign keys.

## `tasks` table

| Column | SQLite type | Constraints and default | Purpose |
| --- | --- | --- | --- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Uniquely identifies each task. |
| `title` | `TEXT` | `NOT NULL`; `CHECK (length(trim(title)) > 0)` | Stores a required title that cannot be empty or whitespace-only. |
| `description` | `TEXT` | `NOT NULL`; `CHECK (length(trim(description)) > 0)` | Stores a required description that cannot be empty or whitespace-only. |
| `due_date` | `TEXT` | `NOT NULL`; `CHECK` requiring the pattern `[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]` | Stores the task due date in `YYYY-MM-DD` format. The schema checks the text pattern; application validation must ensure it represents an acceptable calendar date. |
| `topic` | `TEXT` | `NOT NULL`; `CHECK (length(trim(topic)) > 0)` | Stores a required topic used to categorise and sort tasks. |
| `status` | `TEXT` | `NOT NULL DEFAULT 'Todo'`; `CHECK (status IN ('Todo', 'In-Progress', 'Complete'))` | Stores the task's current workflow status. |
| `archived_at` | `TEXT` | `DEFAULT NULL`; nullable | Stores when the task was archived, or `NULL` while the task is active. |
| `created_at` | `TEXT` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Records when the task row was created. |
| `updated_at` | `TEXT` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Records when the task row was created or most recently updated. The repository must assign a new timestamp whenever it edits a task because the default applies only when a row is inserted. |

## Status and archival rules

The `status` constraint allows exactly:

- `Todo`
- `In-Progress`
- `Complete`

Restricting the value in the database prevents unsupported workflow states and keeps filtering and sorting consistent with the application requirements.

`archived_at` is nullable because active tasks have `archived_at = NULL`. Archiving assigns a timestamp instead of deleting the task or moving it to another table. This preserves the task and records when it was archived, while allowing active and archived views to be selected from the same table.

## Due dates and overdue state

Due dates are stored as `TEXT` in the `YYYY-MM-DD` format. This format is unambiguous and sorts chronologically when consistently stored.

Overdue is not stored as a column because it changes as time passes even when a task row is unchanged. It will be calculated from `due_date` and `status`: a task is overdue when its due date has passed and its status is not `Complete`. Keeping overdue separate prevents it from becoming a fourth status or becoming stale persisted data.

## AI usage declaration

`ChatGPT work 5.6 Sol High` was used to inspect `database/schema.sql` and assist with drafting this database design documentation. The documented columns, types, constraints, and defaults were checked against the current schema.
