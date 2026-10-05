import { NextRequest } from "next/server";
import { memberService } from "@/lib/server/services/member.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    const members = await memberService.getMembers(id, user.userId);
    return apiSuccess(members);
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
    const { email, emails } = body || {};

    if (emails && Array.isArray(emails)) {
      const result = await memberService.addMembers(id, user.userId, emails);
      return apiSuccess(
        result.added,
        201,
        `${result.added.length} member(s) added successfully.`
      );
    }

    if (!email || typeof email !== "string") {
      throw createError("Email is required.", 400);
    }

    const member = await memberService.addMember(id, user.userId, email.trim().toLowerCase());
    return apiSuccess(member, 201, "Member added successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
