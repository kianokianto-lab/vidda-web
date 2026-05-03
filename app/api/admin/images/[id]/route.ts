import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { images } from "@/lib/repos";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  const list = images.list();
  const img = list.find((i) => i.id === params.id);
  if (!img) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // Delete file off disk if it lives in /public/uploads
  if (img.path.startsWith("/uploads/")) {
    const abs = path.join(process.cwd(), "public", img.path);
    await fs.unlink(abs).catch(() => { /* file may already be gone */ });
  }
  images.remove(params.id);
  return NextResponse.json({ ok: true });
}
