import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

import {
  archiveTask,
  createTask,
  findTaskById,
  findTasks,
  updateTask,
} from "../lib/taskRepository.js";

import {
  createDatabase,
} from "../lib/database.js";

describe("task repository", () => {
  let database;

  beforeEach(() => {
    database = createDatabase(":memory:");
  });

  afterEach(() => {
    database.close();
  });

  test("creates, retrieves and edits a task", () => {
    const createdTask = createTask(
      {
        title: "Complete Lab 1",
        description: "Build the todo application",
        dueDate: "2026-08-04",
        topic: "COMS3011A",
        status: "Todo",
      },
      database
    );

    const storedTask = findTaskById(
      createdTask.id,
      database
    );

    expect(storedTask).toMatchObject({
      title: "Complete Lab 1",
      description: "Build the todo application",
      dueDate: "2026-08-04",
      topic: "COMS3011A",
      status: "Todo",
    });

    const updatedTask = updateTask(
      createdTask.id,
      {
        title: "Complete and test Lab 1",
        status: "In-Progress",
      },
      database
    );

    expect(updatedTask.title).toBe(
      "Complete and test Lab 1"
    );

    expect(updatedTask.status).toBe(
      "In-Progress"
    );

    const persistedTask = findTaskById(
      createdTask.id,
      database
    );

    expect(persistedTask.title).toBe(
      "Complete and test Lab 1"
    );
  });

  test("archives a task without deleting it", () => {
    const task = createTask(
      {
        title: "Archive test",
        description: "Confirm archive behaviour",
        dueDate: "2026-08-04",
        topic: "Testing",
        status: "Todo",
      },
      database
    );

    const archivedTask = archiveTask(
      task.id,
      database
    );

    expect(archivedTask.archivedAt).not.toBeNull();

    const activeTasks = findTasks(
      {
        archived: false,
        sortBy: "dueDate",
      },
      database
    );

    expect(activeTasks).toHaveLength(0);

    const archivedTasks = findTasks(
      {
        archived: true,
        sortBy: "dueDate",
      },
      database
    );

    expect(archivedTasks).toHaveLength(1);
    expect(archivedTasks[0].id).toBe(task.id);

    const preservedTask = findTaskById(
      task.id,
      database
    );

    expect(preservedTask).not.toBeNull();
  });

  test("sorts statuses in their logical order", () => {
    const tasks = [
      {
        title: "Complete task",
        description: "Completed",
        dueDate: "2026-08-03",
        topic: "Testing",
        status: "Complete",
      },
      {
        title: "Todo task",
        description: "Not started",
        dueDate: "2026-08-01",
        topic: "Testing",
        status: "Todo",
      },
      {
        title: "Progress task",
        description: "Being completed",
        dueDate: "2026-08-02",
        topic: "Testing",
        status: "In-Progress",
      },
    ];

    for (const task of tasks) {
      createTask(task, database);
    }

    const sortedTasks = findTasks(
      {
        archived: false,
        sortBy: "status",
      },
      database
    );

    expect(
      sortedTasks.map((task) => task.status)
    ).toEqual([
      "Todo",
      "In-Progress",
      "Complete",
    ]);
  });
});
