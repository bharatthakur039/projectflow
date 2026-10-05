import { NextResponse } from "next/server";

export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 500, errors?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function createError(message: string, statusCode = 500, errors?: any): ApiError {
  return new ApiError(message, statusCode, errors);
}

export function apiSuccess<T>(data?: T, status = 200, message?: string, initHeaders?: HeadersInit) {
  const body: Record<string, any> = { success: true };
  if (data !== undefined) body.data = data;
  if (message) body.message = message;

  return NextResponse.json(body, {
    status,
    headers: initHeaders,
  });
}

export function apiError(message: string, status = 500, errors?: any) {
  const body: Record<string, any> = {
    success: false,
    message,
  };
  if (errors !== undefined) body.errors = errors;

  return NextResponse.json(body, { status });
}

export function handleApiError(error: any) {
  console.error("[Next.js API Handler Error]:", error);

  if (error instanceof ApiError) {
    return apiError(error.message, error.statusCode, error.errors);
  }

  if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
    return apiError("Invalid or expired token. Please log in again.", 401);
  }

  // Prisma unique constraint violation (code P2002)
  if (error?.code === "P2002") {
    const target = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "Field";
    return apiError(`${target} already exists.`, 409);
  }

  // Prisma record not found (code P2025)
  if (error?.code === "P2025") {
    return apiError("Record not found.", 404);
  }

  const message = error?.message || "An unexpected server error occurred.";
  const status = typeof error?.statusCode === "number" ? error.statusCode : 500;
  return apiError(message, status);
}
