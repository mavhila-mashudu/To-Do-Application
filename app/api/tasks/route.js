import {
  createTaskService,
  TaskValidationError,
} from "../../../lib/taskService.js";

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

function parseArchivedParameter(value) {
  if (value === null || value === "false") {
    return false;
  }

  if (value === "true") {
    return true;
  }

  throw new TaskValidationError({
    archived: "Archived must be true or false.",
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const archived = parseArchivedParameter(
      searchParams.get("archived")
    );

    const sortBy =
      searchParams.get("sortBy") ?? "dueDate";

    const tasks = taskService.getTasks({
      archived,
      sortBy,
    });

    return Response.json(
      { data: tasks },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      throw new TaskValidationError({
        body: "The request body must contain valid JSON.",
      });
    }

    const task = taskService.createTask(body);

    return Response.json(
      { data: task },
      {
        status: 201,
        headers: {
          Location: `/api/tasks/${task.id}`,
        },
      }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
