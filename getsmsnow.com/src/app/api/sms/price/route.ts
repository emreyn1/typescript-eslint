import { NextRequest, NextResponse } from "next/server";
import { getPrice } from "@/lib/sms-provider";

export async function GET(req: NextRequest) {
  const countryId = req.nextUrl.searchParams.get("country") || req.nextUrl.searchParams.get("countryId") || "";
  const serviceId = req.nextUrl.searchParams.get("service") || req.nextUrl.searchParams.get("serviceId") || "";
  if (!countryId || !serviceId) return NextResponse.json({ error: "country and service required" }, { status: 400 });

  try {
    const data = await getPrice(countryId, serviceId);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
