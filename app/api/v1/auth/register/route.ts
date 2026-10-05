import { NextRequest } from "next/server";
import { authService } from "@/lib/server/services/auth.service";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, password } = body || {};

    if (!full_name || typeof full_name !== "string" || full_name.trim().length === 0) {
      throw createError("Full name is required.", 400);
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError("A valid email address is required.", 400);
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      throw createError("Password must be at least 6 characters long.", 400);
    }

    const user = await authService.register(full_name.trim(), email.trim().toLowerCase(), password);
    return apiSuccess(user, 201, "Account created successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
