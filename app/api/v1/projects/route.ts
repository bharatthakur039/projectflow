import { NextRequest } from "next/server";
import { projectService } from "@/lib/server/services/project.service";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";
import { requireAuth } from "@/lib/server/auth";
import { DEFAULT_PAGE, DEFAULT_LIMIT } from "@/lib/server/constants";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "") || DEFAULT_PAGE;
    const limit = parseInt(searchParams.get("limit") || "") || DEFAULT_LIMIT;

    const result = await projectService.getProjects(user.userId, page, limit);
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { name, description } = body || {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw createError("Project name is required.", 400);
    }

    const project = await projectService.createProject(
      user.userId,
      name.trim(),
      description ? description.trim() : undefined
    );
    return apiSuccess(project, 201, "Project created successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
