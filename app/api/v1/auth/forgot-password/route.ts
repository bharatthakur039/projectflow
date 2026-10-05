import { NextRequest } from "next/server";
import { authService } from "@/lib/server/services/auth.service";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError("A valid email address is required.", 400);
    }

    await authService.forgotPassword(email.trim().toLowerCase());
    return apiSuccess(
      undefined,
      200,
      "If an account with that email exists, a password reset link has been sent."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
