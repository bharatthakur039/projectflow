import { NextRequest } from "next/server";
import { ticketService } from "@/lib/server/services/ticket.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "@/lib/server/constants";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const assigneeIdStr = searchParams.get("assigneeId");
    const sprintIdStr = searchParams.get("sprintId");
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "") || DEFAULT_PAGE;
    const limit = parseInt(searchParams.get("limit") || "") || DEFAULT_LIMIT;

    const filter = {
      status,
      priority,
      assigneeId: assigneeIdStr ? parseInt(assigneeIdStr, 10) : undefined,
      sprintId:
        sprintIdStr === "null"
          ? null
          : sprintIdStr
          ? parseInt(sprintIdStr, 10)
          : undefined,
      search,
      page,
      limit,
    };

    const result = await ticketService.getTickets(id, user.userId, filter);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    const body = await req.json();
    const {
      title,
      description,
      status,
      priority,
      estimation,
      sprintId,
      assigneeId,
      authorId,
    } = body || {};

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      throw createError("Ticket title is required.", 400);
    }

    const ticket = await ticketService.createTicket(id, user.userId, {
      title: title.trim(),
      description: description ?? null,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      estimation:
        estimation && String(estimation).trim() !== ""
          ? String(estimation).trim()
          : null,
      sprint_id: sprintId ?? null,
      assignee_id: assigneeId ?? null,
      author_id: authorId ? parseInt(authorId, 10) : user.userId,
    });

    return apiSuccess(ticket, 201, "Ticket created successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
