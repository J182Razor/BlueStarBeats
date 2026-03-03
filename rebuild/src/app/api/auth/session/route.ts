import { NextResponse } from "next/server";
import { getServerSessionWithEntitlements } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET() {
  const session = await getServerSessionWithEntitlements();
  return NextResponse.json(session, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
