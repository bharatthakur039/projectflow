import { NextRequest } from "next/server";
import { sprintService } from "@/lib/server/services/sprint.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    const sprints = await sprintService.getSprints(id, user.userId);
    return apiSuccess(sprints);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    const body = await req.json();
    const sprint = await sprintService.createSprint(id, user.userId, body);
    return apiSuccess(sprint, 201, "Sprint created successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
