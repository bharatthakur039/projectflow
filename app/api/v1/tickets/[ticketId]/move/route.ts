import { NextRequest } from "next/server";
import { ticketService } from "@/lib/server/services/ticket.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { ticketId } = await params;
    const id = parseInt(ticketId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid ticket ID.", 400);

    const body = await req.json();
    const { status, position, sprintId } = body || {};

    const updated = await ticketService.moveTicket(id, user.userId, {
      status,
      position,
      sprintId,
    });

    return apiSuccess(updated, 200, "Ticket moved successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
