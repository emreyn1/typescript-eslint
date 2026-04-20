import { NextRequest, NextResponse } from "next/server";

const rateMap = new Map<string, { count: number; resetAt: number }>();

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/cards": { max: 15, windowMs: 60_000 },
  "/api/payments/topup": { max: 10, windowMs: 60_000 },
  "/api/payments/webhook": { max: 30, windowMs: 60_000 },
  "/api/auth/register": { max: 5, windowMs: 60_000 },
  "/api/referral": { max: 10, windowMs: 60_000 },
};

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const limit = LIMITS[path];
  if (!limit) return NextResponse.next();

  const ip = getIp(req);
  const key = `${ip}:${path}`;
  const now = Date.now();

  let entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + limit.windowMs };
    rateMap.set(key, entry);
  }
  entry.count++;

  if (entry.count > limit.max) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } },
    );
  }

  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
