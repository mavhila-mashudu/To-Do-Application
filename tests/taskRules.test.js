import {
  describe,
  expect,
  test,
} from "vitest";

import {
  isOverdue,
  isValidDate,
  isValidStatus,
  validateTaskInput,
} from "../lib/taskRules.js";

describe("task rules", () => {
  test("recognises valid and invalid statuses", () => {
    expect(isValidStatus("Todo")).toBe(true);
    expect(isValidStatus("In-Progress")).toBe(true);
    expect(isValidStatus("Complete")).toBe(true);
    expect(isValidStatus("Overdue")).toBe(false);
  });

  test("rejects impossible calendar dates", () => {
    expect(isValidDate("2026-08-04")).toBe(true);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("04-08-2026")).toBe(false);
  });

  test("marks only past incomplete tasks as overdue", () => {
    const today = "2026-07-31";

    expect(
      isOverdue(
        {
          dueDate: "2026-07-30",
          status: "Todo",
        },
        today
      )
    ).toBe(true);

    expect(
      isOverdue(
        {
          dueDate: "2026-07-30",
          status: "Complete",
        },
        today
      )
    ).toBe(false);

    expect(
      isOverdue(
        {
          dueDate: "2026-08-01",
          status: "Todo",
        },
        today
      )
    ).toBe(false);
  });

  test("returns validation errors for invalid input", () => {
    const errors = validateTaskInput({
      title: "",
      description: "Test description",
      dueDate: "2026-02-30",
      topic: "Testing",
      status: "Overdue",
    });

    expect(errors.title).toBeDefined();
    expect(errors.dueDate).toBeDefined();
    expect(errors.status).toBeDefined();
  });
});
