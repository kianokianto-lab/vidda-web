import { NextResponse } from "next/server";
import { validateOrder, computeTotal } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/checkout/stripe
 *
 * STUB. Returns 503 unless STRIPE_SECRET_KEY is set. When the key lands, this
 * route creates a Stripe Payment Intent for the order total and returns
 * { clientSecret } for the client SDK to confirm. Order persistence happens
 * AFTER successful confirmation via the /api/orders endpoint.
 *
 * Stripe is intentionally NOT enabled in M4 — it ships behind the
 * NEXT_PUBLIC_ENABLE_STRIPE flag for the UI and behind STRIPE_SECRET_KEY
 * for the server. Both must be set for the path to activate.
 */
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "Stripe not enabled. Use COD or EasyOrders.", code: "stripe_disabled" },
      { status: 503 }
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }

  const v = validateOrder(body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  // When live: import("stripe") then create payment intent with amount = computeTotal(v.value.lines) * 100.
  // We compute here to surface in the stub for completeness.
  const amount = computeTotal(v.value.lines) * 100;

  return NextResponse.json(
    { ok: false, error: "Stripe stub — wire client at M6", code: "stub", amountInPiastres: amount },
    { status: 501 }
  );
}
