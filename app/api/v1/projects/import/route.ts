import { NextRequest } from "next/server";
import { projectExcelService } from "@/lib/server/services/project-excel.service";
import { requireAuth } from "@/lib/server/auth";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      throw createError("Please upload an Excel (.xlsx) file.", 400);
    }

    const blobFile = file as Blob;
    const arrayBuffer = await blobFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await projectExcelService.importProjectFromXlsx(user.userId, buffer);
    return apiSuccess(result, 201, "Project imported successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
