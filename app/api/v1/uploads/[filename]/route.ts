import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    if (!filename) throw createError("Filename is required.", 400);

    const safeName = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", safeName);

    if (existsSync(filePath)) {
      await fs.unlink(filePath);
    }

    return apiSuccess(undefined, 200, "File deleted successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
