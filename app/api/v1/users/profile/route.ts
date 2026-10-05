import { NextRequest } from "next/server";
import argon2 from "argon2";
import { userRepository } from "@/lib/server/repositories/user.repository";
import { apiSuccess, handleApiError, createError } from "@/lib/server/response";
import { requireAuth } from "@/lib/server/auth";

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { full_name, password } = body || {};

    const updateData: { full_name?: string; password_hash?: string } = {};

    if (full_name && typeof full_name === "string" && full_name.trim().length > 0) {
      updateData.full_name = full_name.trim();
    }
    if (password && typeof password === "string") {
      if (password.length < 6) {
        throw createError("Password must be at least 6 characters long.", 400);
      }
      updateData.password_hash = await argon2.hash(password);
    }

    const updatedUser = await userRepository.updateProfile(user.userId, updateData);
    return apiSuccess(updatedUser, 200, "Profile updated successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
