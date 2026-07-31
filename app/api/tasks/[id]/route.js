import {
  createTaskService,
  TaskNotFoundError,
  TaskValidationError,
} from "../../../../lib/taskService.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const taskService = createTaskService();

function createErrorResponse(error) {
  if (error instanceof TaskValidationError) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
          fields: error.errors,
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof TaskNotFoundError) {
    return Response.json(
      {
        error: {
          code: "TASK_NOT_FOUND",
          message: error.message,
        },
      },
      { status: 404 }
    );
  }

  console.error("Unexpected task API error:", error);

  return Response.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    },
    { status: 500 }
  );
}

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const task = taskService.getTaskById(id);

    return Response.json(
      { data: task },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;

    let body;

    try {
      body = await request.json();
    } catch {
      throw new TaskValidationError({
        body: "The request body must contain valid JSON.",
      });
    }

    const isArchiveRequest =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      Object.prototype.hasOwnProperty.call(
        body,
        "archived"
      );

    let task;

    if (isArchiveRequest) {
      const fields = Object.keys(body);

      if (
        body.archived !== true ||
        fields.length !== 1
      ) {
        throw new TaskValidationError({
          archived:
            "Archiving requires only archived: true.",
        });
      }

      task = taskService.archiveTask(id);
    } else {
      task = taskService.updateTask(id, body);
    }

    return Response.json(
      { data: task },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
