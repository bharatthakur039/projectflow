import { NextRequest } from "next/server";
import { sprintService } from "@/lib/server/services/sprint.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { sprintId } = await params;
    const id = parseInt(sprintId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid sprint ID.", 400);

    const sprint = await sprintService.getSprintById(id, user.userId);
    return apiSuccess(sprint);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { sprintId } = await params;
    const id = parseInt(sprintId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid sprint ID.", 400);

    const body = await req.json();
    const updated = await sprintService.updateSprint(id, user.userId, body);
    return apiSuccess(updated, 200, "Sprint updated successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { sprintId } = await params;
    const id = parseInt(sprintId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid sprint ID.", 400);

    await sprintService.deleteSprint(id, user.userId);
    return apiSuccess(undefined, 200, "Sprint deleted successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
