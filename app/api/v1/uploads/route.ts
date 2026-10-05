import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      throw createError("No file uploaded.", 400);
    }

    const blob = file as Blob & { name?: string };
    const originalName = blob.name || "upload";
    const ext = path.extname(originalName) || ".bin";
    const filename = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const url = `${protocol}://${host}/uploads/${filename}`;

    return apiSuccess({
      url,
      filename,
      originalName,
      mimetype: blob.type || "application/octet-stream",
      size: blob.size,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
