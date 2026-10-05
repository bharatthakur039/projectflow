import { apiSuccess } from "@/lib/server/response";
import { clearAuthCookie } from "@/lib/server/auth";

export async function POST() {
  const response = apiSuccess(undefined, 200, "Logged out successfully.");
  return clearAuthCookie(response);
}
