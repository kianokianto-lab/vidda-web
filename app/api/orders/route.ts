import { NextResponse } from "next/server";
import { createOrder, validateOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/orders
 * Body: OrderInput (see lib/orders.ts).
 * Persists to /data/orders.jsonl and fans out to EO_WEBHOOK_URL if set.
 *
 * The single ingestion endpoint for COD orders submitted via the in-site checkout.
 * Stripe orders POST here too once payment intent succeeds (M6 enable).
 */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }

  const v = validateOrder(body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  try {
    const order = await createOrder(v.value);
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "create failed" }, { status: 500 });
  }
}
