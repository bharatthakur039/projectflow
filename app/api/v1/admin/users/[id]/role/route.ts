import { NextRequest } from "next/server";
import { userRepository } from "@/lib/server/repositories/user.repository";
import { requireAdmin } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin(req);
    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) throw createError("Invalid user ID.", 400);

    const body = await req.json();
    const { role } = body || {};

    if (!role || !["ADMIN", "USER"].includes(role)) {
      throw createError("Invalid role. Allowed values: ADMIN, USER.", 400);
    }

    if (adminUser.userId === userId && role !== "ADMIN") {
      throw createError("You cannot demote yourself from ADMIN.", 400);
    }

    const updated = await userRepository.updateRole(userId, role);
    return apiSuccess(
      updated,
      200,
      `Role for ${updated.full_name} updated to ${role}.`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
