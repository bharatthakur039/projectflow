import { NextRequest, NextResponse } from "next/server";
import { projectExcelService } from "@/lib/server/services/project-excel.service";
import { requireAuth } from "@/lib/server/auth";
import { createError, handleApiError } from "@/lib/server/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    const { buffer, filename } = await projectExcelService.exportProject(id, user.userId);

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
