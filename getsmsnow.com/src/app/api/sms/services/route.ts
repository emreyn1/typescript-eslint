import { NextResponse } from "next/server";
import { getServices } from "@/lib/sms-provider";

export async function GET() {
  try {
    const data = await getServices();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message, services: [] }, { status: 500 });
  }
}
