import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { JWT_COOKIE_NAME } from "./constants";
import { createError } from "./response";
import prisma from "@/lib/prisma";

export interface JwtPayload {
  userId: number;
  email: string;
  role?: string;
}

export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET || "super_secure_projectflow_jwt_secret_key_12345";
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET || "super_secure_projectflow_jwt_secret_key_12345";
  return jwt.verify(token, secret) as JwtPayload;
}

export async function getAuthUser(req?: NextRequest): Promise<JwtPayload | null> {
  let token: string | undefined;

  if (req) {
    token =
      req.cookies.get(JWT_COOKIE_NAME)?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(JWT_COOKIE_NAME)?.value;
    } catch {
      // Outside Request context
    }
  }

  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(req?: NextRequest): Promise<JwtPayload> {
  const user = await getAuthUser(req);
  if (!user) {
    throw createError("Authentication required. Please log in.", 401);
  }
  return user;
}

export async function requireAdmin(req?: NextRequest): Promise<JwtPayload> {
  const user = await requireAuth(req);

  if (user.role === "ADMIN") {
    return user;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    throw createError("Access denied. Admin role required.", 403);
  }

  return user;
}

export function setAuthCookie(response: NextResponse, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(JWT_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
