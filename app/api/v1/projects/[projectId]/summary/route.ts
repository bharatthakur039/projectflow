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

    const summary = await projectService.getProjectSummary(id, user.userId);
    return apiSuccess(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
