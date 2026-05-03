import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { images } from "@/lib/repos";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const MAX_BYTES = 8 * 1024 * 1024;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }); }

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "file field required" }, { status: 400 });
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return NextResponse.json({ ok: false, error: `Unsupported type ${file.type}` }, { status: 415 });

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) return NextResponse.json({ ok: false, error: "Max 8MB" }, { status: 413 });

  const buf = Buffer.from(bytes);
  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 12);
  const filename = `${Date.now().toString(36)}-${hash}.${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);

  const publicPath = `/uploads/${filename}`;
  const record = images.create({
    path: publicPath,
    alt: null,
    width: null,
    height: null,
    bytes: buf.byteLength,
  });

  return NextResponse.json({ ok: true, image: record });
}
