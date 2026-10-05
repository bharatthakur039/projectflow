import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/server/services/project.service";
import { projectExcelService } from "@/lib/server/services/project-excel.service";
import { requireAuth } from "@/lib/server/auth";
import { createError, handleApiError } from "@/lib/server/response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const projectIdsParam = searchParams.get("projectIds");

    let ids: number[] = [];
    if (projectIdsParam && projectIdsParam.trim().length > 0) {
      ids = projectIdsParam
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((n) => !isNaN(n) && n > 0);
    }

    if (ids.length === 0) {
      const result = await projectService.getProjects(user.userId, 1, 1000);
      ids = result.projects.map((p: any) => p.id);
    }

    if (ids.length === 0) {
      throw createError("No projects available to export.", 400);
    }

    const { buffer, filename } = await projectExcelService.exportProjects(ids, user.userId);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
