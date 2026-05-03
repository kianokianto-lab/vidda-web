import { NextResponse } from "next/server";
import { subscribe } from "@/lib/subscribe";

// Force dynamic so this route is never statically prerendered.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }

  const { email, source, locale } = (body || {}) as { email?: string; source?: string; locale?: string };
  if (typeof email !== "string") {
    return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
  }

  const result = await subscribe({ email, source, locale });
  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }
  return NextResponse.json(result, { status: 200 });
}
