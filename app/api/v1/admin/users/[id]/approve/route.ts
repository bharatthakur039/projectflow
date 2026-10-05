import { NextRequest } from "next/server";
import { userRepository } from "@/lib/server/repositories/user.repository";
import { requireAdmin } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) throw createError("Invalid user ID.", 400);

    const user = await userRepository.findById(userId);
    if (!user) throw createError("User not found.", 404);

    const updated = await userRepository.updateApprovalStatus(userId, "APPROVED", true);
    return apiSuccess(
      updated,
      200,
      `User ${updated.full_name} has been approved successfully.`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
