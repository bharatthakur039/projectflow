import { NextRequest } from "next/server";
import { sprintService } from "@/lib/server/services/sprint.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { sprintId } = await params;
    const id = parseInt(sprintId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid sprint ID.", 400);

    const sprint = await sprintService.completeSprint(id, user.userId);
    return apiSuccess(sprint, 200, "Sprint completed successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
