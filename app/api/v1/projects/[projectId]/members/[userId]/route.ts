import { NextRequest } from "next/server";
import { memberService } from "@/lib/server/services/member.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId, userId } = await params;
    const pId = parseInt(projectId, 10);
    const uId = parseInt(userId, 10);

    if (isNaN(pId) || pId <= 0 || isNaN(uId) || uId <= 0) {
      throw createError("Invalid project ID or user ID.", 400);
    }

    await memberService.removeMember(pId, user.userId, uId);
    return apiSuccess(undefined, 200, "Member removed successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
