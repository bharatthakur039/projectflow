import { NextRequest } from "next/server";
import { authService } from "@/lib/server/services/auth.service";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body || {};

    if (!token || typeof token !== "string") {
      throw createError("Reset token is required.", 400);
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      throw createError("Password must be at least 6 characters long.", 400);
    }

    await authService.resetPassword(token, password);
    return apiSuccess(undefined, 200, "Password has been successfully reset.");
  } catch (error) {
    return handleApiError(error);
  }
}
