import { NextRequest } from "next/server";
import { ticketService } from "@/lib/server/services/ticket.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, handleApiError } from "@/lib/server/response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const data = await ticketService.getDashboardData(user.userId);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
