import { NextRequest } from "next/server";
import { ticketService } from "@/lib/server/services/ticket.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { ticketId } = await params;
    const id = parseInt(ticketId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid ticket ID.", 400);

    const ticket = await ticketService.getTicketById(id, user.userId);
    return apiSuccess(ticket);
  } catch (error) {
    return handleApiError(error);
  }
}

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
    const {
      title,
      description,
      status,
      priority,
      estimation,
      assigneeId,
      sprintId,
      authorId,
    } = body || {};

    const updated = await ticketService.updateTicket(id, user.userId, {
      title,
      description,
      status,
      priority,
      estimation:
        estimation !== undefined
          ? estimation && String(estimation).trim() !== ""
            ? String(estimation).trim()
            : null
          : undefined,
      assignee_id: assigneeId,
      sprint_id: sprintId,
      author_id: authorId ? parseInt(authorId, 10) : undefined,
    });

    return apiSuccess(updated, 200, "Ticket updated successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { ticketId } = await params;
    const id = parseInt(ticketId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid ticket ID.", 400);

    await ticketService.deleteTicket(id, user.userId);
    return apiSuccess(undefined, 200, "Ticket deleted successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
