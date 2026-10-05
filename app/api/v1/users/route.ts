import { NextRequest } from "next/server";
import { userRepository } from "@/lib/server/repositories/user.repository";
import { apiSuccess, handleApiError } from "@/lib/server/response";
import { requireAuth } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const users = await userRepository.findAllActive();
    return apiSuccess(users);
  } catch (error) {
    return handleApiError(error);
  }
}
