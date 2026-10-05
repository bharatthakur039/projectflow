import { NextRequest, NextResponse } from "next/server";
import { projectExcelService } from "@/lib/server/services/project-excel.service";
import { requireAuth } from "@/lib/server/auth";
import { handleApiError } from "@/lib/server/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const buffer = await projectExcelService.generateSampleTemplate();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="ProjectFlow_Sample_Template.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
