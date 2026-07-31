import {
  archiveTask,
  createTask,
  findTaskById,
  findTasks,
  updateTask,
} from "./taskRepository.js";
import {
  getTodayDate,
  isOverdue,
  isValidSortOption,
  validateTaskInput,
} from "./taskRules.js";

const EDITABLE_FIELDS = [
  "title",
  "description",
  "dueDate",
  "topic",
  "status",
];

const defaultRepository = {
  archiveTask,
  createTask,
  findTaskById,
  findTasks,
  updateTask,
};

export class TaskValidationError extends Error {
  constructor(errors) {
    super("Task validation failed.");
    this.name = "TaskValidationError";
    this.errors = errors;
  }
}

export class TaskNotFoundError extends Error {
  constructor(id) {
    super(`Task with ID ${id} was not found.`);
    this.name = "TaskNotFoundError";
    this.taskId = id;
  }
}

function validateTaskId(id) {
  const numericId = Number(id);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new TaskValidationError({
      id: "Task ID must be a positive integer.",
    });
  }

  return numericId;
}

function normalizeTaskFields(input) {
  const normalized = {};

  for (const field of EDITABLE_FIELDS) {
    if (
      Object.prototype.hasOwnProperty.call(
        input,
        field
      )
    ) {
      const value = input[field];

      normalized[field] =
        typeof value === "string"
          ? value.trim()
          : value;
    }
  }

  return normalized;
}

function throwForValidationErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new TaskValidationError(errors);
  }
}

export function createTaskService(
  repository = defaultRepository,
  todayProvider = getTodayDate
) {
  function addDerivedInformation(task) {
    if (!task) {
      return null;
    }

    return {
      ...task,
      overdue: isOverdue(task, todayProvider()),
    };
  }

  function createTask(input) {
    const normalized = normalizeTaskFields({
      title: input?.title,
      description: input?.description,
      dueDate: input?.dueDate,
      topic: input?.topic,
      status: input?.status ?? "Todo",
    });

    const errors = validateTaskInput(normalized);
    throwForValidationErrors(errors);

    const task = repository.createTask(normalized);

    return addDerivedInformation(task);
  }

  function getTaskById(id) {
    const taskId = validateTaskId(id);
    const task = repository.findTaskById(taskId);

    if (!task) {
      throw new TaskNotFoundError(taskId);
    }

    return addDerivedInformation(task);
  }

  function getTasks({
    archived = false,
    sortBy = "dueDate",
  } = {}) {
    if (typeof archived !== "boolean") {
      throw new TaskValidationError({
        archived: "Archived must be true or false.",
      });
    }

    if (!isValidSortOption(sortBy)) {
      throw new TaskValidationError({
        sortBy:
          "Sort option must be topic, status or dueDate.",
      });
    }

    const tasks = repository.findTasks({
      archived,
      sortBy,
    });

    return tasks.map(addDerivedInformation);
  }

  function updateTask(id, input) {
    const taskId = validateTaskId(id);

    const existingTask =
      repository.findTaskById(taskId);

    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    if (
      !input ||
      typeof input !== "object" ||
      Array.isArray(input)
    ) {
      throw new TaskValidationError({
        form: "Task changes must be an object.",
      });
    }

    const changes = normalizeTaskFields(input);

    if (Object.keys(changes).length === 0) {
      throw new TaskValidationError({
        form: "Provide at least one editable field.",
      });
    }

    const errors = validateTaskInput(changes, {
      partial: true,
    });

    throwForValidationErrors(errors);

    const updatedTask = repository.updateTask(
      taskId,
      changes
    );

    if (!updatedTask) {
      throw new TaskNotFoundError(taskId);
    }

    return addDerivedInformation(updatedTask);
  }

  function archiveTask(id) {
    const taskId = validateTaskId(id);

    const existingTask =
      repository.findTaskById(taskId);

    if (!existingTask) {
      throw new TaskNotFoundError(taskId);
    }

    // Archiving an already archived task is harmless.
    if (existingTask.archivedAt) {
      return addDerivedInformation(existingTask);
    }

    const archivedTask =
      repository.archiveTask(taskId);

    if (!archivedTask) {
      throw new TaskNotFoundError(taskId);
    }

    return addDerivedInformation(archivedTask);
  }

  return {
    createTask,
    getTaskById,
    getTasks,
    updateTask,
    archiveTask,
  };
}
