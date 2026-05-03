import { NextResponse } from "next/server";
import { getSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = typeof (body as { password?: unknown }).password === "string"
    ? (body as { password: string }).password : "";
  if (!password) return NextResponse.json({ ok: false, error: "Password required" }, { status: 400 });

  const ok = await verifyPassword(password);
  if (!ok) return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });

  const session = await getSession();
  session.loggedIn = true;
  session.user = { id: "admin" };
  session.loggedInAt = Date.now();
  await session.save();
  return NextResponse.json({ ok: true });
}
