import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/webhooks/easyorders
 *
 * Inbound webhook from EasyOrders for order status / inventory updates.
 *
 * Signature verification: if EO_WEBHOOK_VERIFY_SECRET is set, the request
 * must include a header `X-EO-Signature` containing the HMAC-SHA256 of the
 * raw body. Otherwise we accept any body in dev/preview.
 *
 * Persistence: the event is currently logged to stdout (greppable as
 * [eo-webhook] event=...). M5 wires this into the SQLite event log so the
 * admin dashboard can show the audit trail.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.EO_WEBHOOK_VERIFY_SECRET;
  if (secret) {
    const sig = req.headers.get("x-eo-signature") ?? "";
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (sig !== expected) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: unknown;
  try { body = JSON.parse(raw); } catch { body = { raw }; }
  const event = (body as { event?: string }).event ?? "unknown";
  console.log(`[eo-webhook] event=${event} payload=${raw.slice(0, 500)}`);

  return NextResponse.json({ ok: true, received: event }, { status: 200 });
}
