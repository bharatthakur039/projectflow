import { NextRequest } from "next/server";
import { projectExcelService } from "@/lib/server/services/project-excel.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireAuth(req);
    const { projectId } = await params;
    const id = parseInt(projectId, 10);
    if (isNaN(id) || id <= 0) throw createError("Invalid project ID.", 400);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      throw createError("Please upload an Excel (.xlsx) file.", 400);
    }

    const blobFile = file as Blob;
    const arrayBuffer = await blobFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await projectExcelService.importProjectFromXlsx(user.userId, buffer, id);
    return apiSuccess(result, 200, "Data imported into project successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
