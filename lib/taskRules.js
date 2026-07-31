export const TASK_STATUSES = Object.freeze(["Todo", "In-Progress", "Complete"]);

export const TASK_SORT_OPTIONS = Object.freeze(["topic", "status", "dueDate"]);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidStatus(status) {
  return TASK_STATUSES.includes(status);
}

export function isValidSortOption(sortBy) {
  return TASK_SORT_OPTIONS.includes(sortBy);
}

export function isValidDate(dateValue) {
  if (typeof dateValue !== "string" || !DATE_PATTERN.test(dateValue)) {
    return false;
  }

  const [year, month, day] = dateValue.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function getTodayDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isOverdue(task, today = getTodayDate()) {
  if (!task || !isValidDate(task.dueDate) || !isValidDate(today)) {
    return false;
  }

  return task.status !== "Complete" && task.dueDate < today;
}

export function validateTaskInput(input, { partial = false } = {}) {
  const errors = {};

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      form: "Task information must be an object.",
    };
  }

  const requiredTextFields = ["title", "description", "topic"];

  for (const field of requiredTextFields) {
    const fieldWasProvided = Object.prototype.hasOwnProperty.call(input, field);

    if (partial && !fieldWasProvided) {
      continue;
    }

    if (typeof input[field] !== "string" || input[field].trim().length === 0) {
      errors[field] = `${field} is required.`;
    }
  }

  const dueDateWasProvided = Object.prototype.hasOwnProperty.call(
    input,
    "dueDate",
  );

  if ((!partial || dueDateWasProvided) && !isValidDate(input.dueDate)) {
    errors.dueDate = "Due date must be a valid date in YYYY-MM-DD format.";
  }

  const statusWasProvided = Object.prototype.hasOwnProperty.call(
    input,
    "status",
  );

  if (statusWasProvided && !isValidStatus(input.status)) {
    errors.status = "Status must be Todo, In-Progress or Complete.";
  }

  return errors;
}
