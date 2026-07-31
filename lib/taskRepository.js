import { getDatabase } from "./database.js";

const TASK_COLUMNS = `
  id,
  title,
  description,
  due_date,
  topic,
  status,
  archived_at,
  created_at,
  updated_at
`;

const EDITABLE_COLUMNS = {
  title: "title",
  description: "description",
  dueDate: "due_date",
  topic: "topic",
  status: "status",
};

// Values come only from this fixed map, never directly from user input.
const SORT_EXPRESSIONS = {
  topic: "topic COLLATE NOCASE ASC",
  status: `
    CASE status
      WHEN 'Todo' THEN 1
      WHEN 'In-Progress' THEN 2
      WHEN 'Complete' THEN 3
      ELSE 4
    END ASC
  `,
  dueDate: "due_date ASC",
};

function toTask(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    topic: row.topic,
    status: row.status,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createTask(task, database = getDatabase()) {
  const hasStatus = Object.hasOwn(task, "status");
  const statement = hasStatus
    ? database.prepare(`
        INSERT INTO tasks (
          title,
          description,
          due_date,
          topic,
          status
        )
        VALUES (?, ?, ?, ?, ?)
      `)
    : database.prepare(`
        INSERT INTO tasks (
          title,
          description,
          due_date,
          topic
        )
        VALUES (?, ?, ?, ?)
      `);

  const values = [
    task.title,
    task.description,
    task.dueDate,
    task.topic,
  ];

  if (hasStatus) {
    values.push(task.status);
  }

  const result = statement.run(...values);
  return findTaskById(result.lastInsertRowid, database);
}

export function findTaskById(id, database = getDatabase()) {
  const row = database
    .prepare(`
      SELECT ${TASK_COLUMNS}
      FROM tasks
      WHERE id = ?
    `)
    .get(id);

  return toTask(row);
}

export function findTasks(
  options = {},
  database = getDatabase()
) {
  const archiveCondition =
    options.archived === true
      ? "archived_at IS NOT NULL"
      : "archived_at IS NULL";
  const orderBy =
    SORT_EXPRESSIONS[options.sortBy] ??
    SORT_EXPRESSIONS.dueDate;

  const rows = database
    .prepare(`
      SELECT ${TASK_COLUMNS}
      FROM tasks
      WHERE ${archiveCondition}
      ORDER BY ${orderBy}, id ASC
    `)
    .all();

  return rows.map(toTask);
}

export function updateTask(
  id,
  changes,
  database = getDatabase()
) {
  const assignments = [];
  const values = [];

  for (const [field, column] of Object.entries(
    EDITABLE_COLUMNS
  )) {
    if (Object.hasOwn(changes, field)) {
      assignments.push(`${column} = ?`);
      values.push(changes[field]);
    }
  }

  if (assignments.length === 0) {
    return findTaskById(id, database);
  }

  assignments.push("updated_at = CURRENT_TIMESTAMP");
  const result = database
    .prepare(`
      UPDATE tasks
      SET ${assignments.join(", ")}
      WHERE id = ?
    `)
    .run(...values, id);

  if (result.changes === 0) {
    return null;
  }

  return findTaskById(id, database);
}

export function archiveTask(
  id,
  database = getDatabase()
) {
  const result = database
    .prepare(`
      UPDATE tasks
      SET
        archived_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .run(id);

  if (result.changes === 0) {
    return null;
  }

  return findTaskById(id, database);
}
