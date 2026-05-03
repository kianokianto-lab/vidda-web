import { NextResponse } from "next/server";
import { sections } from "@/lib/repos";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const KINDS = ["hero", "band", "feature", "promo"] as const;
type Kind = typeof KINDS[number];

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  return NextResponse.json({ ok: true, sections: sections.list() });
}

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  const b = await req.json().catch(() => ({})) as Record<string, unknown>;
  if (!KINDS.includes(b.kind as Kind)) return NextResponse.json({ ok: false, error: `kind must be ${KINDS.join("|")}` }, { status: 400 });
  const created = sections.create({
    kind: b.kind as Kind,
    title: typeof b.title === "string" ? b.title : null,
    body: typeof b.body === "string" ? b.body : null,
    cta_label: typeof b.cta_label === "string" ? b.cta_label : null,
    cta_href: typeof b.cta_href === "string" ? b.cta_href : null,
    image: typeof b.image === "string" ? b.image : null,
    sort: typeof b.sort === "number" ? b.sort : 0,
    enabled: b.enabled !== false,
  });
  return NextResponse.json({ ok: true, section: created });
}
