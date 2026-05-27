import { NextRequest, NextResponse } from "next/server";

const rateMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/sms/order": { max: 10, windowMs: 60_000 },
  "/api/sms/check": { max: 60, windowMs: 60_000 },
  "/api/sms/price": { max: 30, windowMs: 60_000 },
  "/api/sms/cancel": { max: 10, windowMs: 60_000 },
  "/api/orders/cancel": { max: 10, windowMs: 60_000 },
  "/api/guest/create-payment": { max: 5, windowMs: 60_000 },
  "/api/nowpayments/webhook": { max: 30, windowMs: 60_000 },
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const limit = RATE_LIMITS[pathname];
  if (!limit) return NextResponse.next();

  const ip = getClientIp(req);
  const key = `${ip}:${pathname}`;
  const now = Date.now();

  let entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + limit.windowMs };
    rateMap.set(key, entry);
  }

  entry.count++;

  if (entry.count > limit.max) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(limit.max),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(limit.max));
  response.headers.set("X-RateLimit-Remaining", String(limit.max - entry.count));

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
