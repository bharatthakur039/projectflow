import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";
import { apiSuccess, createError, handleApiError } from "@/lib/server/response";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      throw createError("No files uploaded.", 400);
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";

    const uploaded = await Promise.all(
      files.map(async (file) => {
        if (typeof file === "string") return null;
        const blob = file as Blob & { name?: string };
        const originalName = blob.name || "upload";
        const ext = path.extname(originalName) || ".bin";
        const filename = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(path.join(uploadDir, filename), buffer);

        return {
          url: `${protocol}://${host}/uploads/${filename}`,
          filename,
          originalName,
          mimetype: blob.type || "application/octet-stream",
          size: blob.size,
        };
      })
    );

    const validUploaded = uploaded.filter(Boolean);
    return apiSuccess(validUploaded);
  } catch (error) {
    return handleApiError(error);
  }
}
