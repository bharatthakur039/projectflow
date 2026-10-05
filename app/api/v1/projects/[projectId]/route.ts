import { NextRequest } from "next/server";
import { projectService } from "@/lib/server/services/project.service";
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

    const project = await projectService.getProjectById(id, user.userId);
    return apiSuccess(project);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    const body = await req.json();
    const updated = await projectService.updateProject(id, user.userId, body);
    return apiSuccess(updated, 200, "Project updated successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    await projectService.deleteProject(id, user.userId);
    return apiSuccess(undefined, 200, "Project deleted successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
