import { NextResponse } from "next/server";
import { products } from "@/lib/repos";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false, error: "Body required" }, { status: 400 });
  const b = body as Record<string, unknown>;
  if (typeof b.slug !== "string" || typeof b.title !== "string" || typeof b.price !== "number") {
    return NextResponse.json({ ok: false, error: "slug, title, price required" }, { status: 400 });
  }
  try {
    const created = products.create({
      slug: String(b.slug),
      title: String(b.title),
      title_ar: typeof b.title_ar === "string" ? b.title_ar : null,
      price: Number(b.price),
      price_before: typeof b.price_before === "number" ? b.price_before : null,
      description: typeof b.description === "string" ? b.description : null,
      images: Array.isArray(b.images) ? (b.images as { src: string; alt?: string }[]) : [],
      options: Array.isArray(b.options) ? (b.options as { name: string; values: string[] }[]) : [],
      in_stock: b.in_stock !== false,
      sku: typeof b.sku === "string" ? b.sku : null,
      collection_id: typeof b.collection_id === "string" ? b.collection_id : null,
    });
    return NextResponse.json({ ok: true, product: created });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Create failed" }, { status: 500 });
  }
}
