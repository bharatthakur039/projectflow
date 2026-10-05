import { NextRequest } from "next/server";
import { authService } from "@/lib/server/services/auth.service";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";
import { setAuthCookie } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError("A valid email address is required.", 400);
    }
    if (!password || typeof password !== "string") {
      throw createError("Password is required.", 400);
    }

    const { user, token } = await authService.login(email.trim().toLowerCase(), password);
    const response = apiSuccess({ user, token }, 200, "Logged in successfully.");
    return setAuthCookie(response, token);
  } catch (error) {
    return handleApiError(error);
  }
}
