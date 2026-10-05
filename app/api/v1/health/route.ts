import { NextResponse } from "next/server";
import { APP_NAME, APP_VERSION } from "@/lib/server/constants";

export async function GET() {
  return NextResponse.json({
    success: true,
    name: APP_NAME,
    version: APP_VERSION,
    message: `${APP_NAME} API ${APP_VERSION} is running in Next.js fullstack.`,
    timestamp: new Date().toISOString(),
  });
}
