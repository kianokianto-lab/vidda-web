import { NextResponse } from "next/server";
import { collections } from "@/lib/repos";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  return NextResponse.json({ ok: true, collections: collections.list() });
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (typeof b.slug !== "string" || typeof b.title !== "string") {
    return NextResponse.json({ ok: false, error: "slug + title required" }, { status: 400 });
  }
  const created = collections.create({
    slug: b.slug,
    title: b.title,
    description: typeof b.description === "string" ? b.description : null,
    hero_image: typeof b.hero_image === "string" ? b.hero_image : null,
    sort: typeof b.sort === "number" ? b.sort : 0,
  });
  return NextResponse.json({ ok: true, collection: created });
}
