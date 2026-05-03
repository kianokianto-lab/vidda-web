import { NextResponse } from "next/server";
import { orders, DbOrder } from "@/lib/repos";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID: DbOrder["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  const b = await req.json().catch(() => ({})) as { status?: string };
  if (!b.status || !VALID.includes(b.status as DbOrder["status"])) {
    return NextResponse.json({ ok: false, error: `status must be one of ${VALID.join(", ")}` }, { status: 400 });
  }
  const updated = orders.setStatus(params.id, b.status as DbOrder["status"]);
  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, order: updated });
}
