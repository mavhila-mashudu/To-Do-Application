import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_DATABASE_PATH = path.join(
  process.cwd(),
  "data",
  "tasks.db"
);

const SCHEMA_PATH = path.join(
  process.cwd(),
  "database",
  "schema.sql"
);

/**
 * Creates a SQLite connection and initializes its schema.
 *
 * A different path, including ":memory:", can be supplied for testing.
 */
export function createDatabase(
  databasePath = DEFAULT_DATABASE_PATH
) {
  const isMemoryDatabase = databasePath === ":memory:";

  if (!isMemoryDatabase) {
    mkdirSync(path.dirname(databasePath), {
      recursive: true,
    });
  }

  const database = new Database(databasePath);

  try {
    database.pragma("foreign_keys = ON");

    if (!isMemoryDatabase) {
      database.pragma("journal_mode = WAL");
    }

    const schema = readFileSync(SCHEMA_PATH, "utf8");
    database.exec(schema);

    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}

const DATABASE_KEY = Symbol.for("todo.database");

/**
 * Returns one shared connection for the running application.
 */
export function getDatabase() {
  if (!globalThis[DATABASE_KEY]) {
    globalThis[DATABASE_KEY] = createDatabase();
  }

  return globalThis[DATABASE_KEY];
}
