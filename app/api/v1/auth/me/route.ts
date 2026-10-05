import { NextRequest } from "next/server";
import { authService } from "@/lib/server/services/auth.service";
import { apiSuccess, handleApiError } from "@/lib/server/response";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireAuth(req);
    const user = await authService.getMe(authUser.userId);
    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
