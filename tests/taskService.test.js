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

import {
  createTaskService,
  TaskNotFoundError,
  TaskValidationError,
} from "../lib/taskService.js";

describe("task service", () => {
  let database;
  let service;

  beforeEach(() => {
    database = createDatabase(":memory:");

    const repository = {
      createTask: (task) =>
        createTask(task, database),

      findTaskById: (id) =>
        findTaskById(id, database),

      findTasks: (options) =>
        findTasks(options, database),

      updateTask: (id, changes) =>
        updateTask(id, changes, database),

      archiveTask: (id) =>
        archiveTask(id, database),
    };

    service = createTaskService(
      repository,
      () => "2026-07-31"
    );
  });

  afterEach(() => {
    database.close();
  });

  test("adds deterministic overdue information", () => {
    const task = service.createTask({
      title: "Past task",
      description: "This task is overdue",
      dueDate: "2026-07-30",
      topic: "Testing",
      status: "Todo",
    });

    expect(task.overdue).toBe(true);

    const completedTask = service.updateTask(
      task.id,
      {
        status: "Complete",
      }
    );

    expect(completedTask.overdue).toBe(false);
  });

  test("rejects invalid task information", () => {
    expect(() =>
      service.createTask({
        title: "",
        description: "Invalid task",
        dueDate: "2026-02-30",
        topic: "Testing",
        status: "Overdue",
      })
    ).toThrow(TaskValidationError);
  });

  test("throws an error when a task does not exist", () => {
    expect(() =>
      service.getTaskById(9999)
    ).toThrow(TaskNotFoundError);
  });
});
