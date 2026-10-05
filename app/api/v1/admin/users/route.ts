import { NextRequest } from "next/server";
import { userRepository } from "@/lib/server/repositories/user.repository";
import { requireAdmin } from "@/lib/server/auth";
import { apiSuccess, handleApiError } from "@/lib/server/response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const role = searchParams.get("role") || undefined;

    const users = await userRepository.findAllUsers({
      approval_status: status,
      role,
    });

    return apiSuccess(users);
  } catch (error) {
    return handleApiError(error);
  }
}
