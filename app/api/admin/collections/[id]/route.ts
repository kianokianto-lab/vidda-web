import { NextResponse } from "next/server";
import { collections, DbCollection } from "@/lib/repos";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  const body = await req.json().catch(() => null) as Partial<DbCollection> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Body required" }, { status: 400 });
  const updated = collections.update(params.id, body);
  if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, collection: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  return NextResponse.json({ ok: collections.remove(params.id) });
}
