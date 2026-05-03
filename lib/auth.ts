/**
 * Admin auth for VIDDA WEAR (M5) — Node runtime only.
 *
 * Single admin user. Password stored as bcrypt hash in env.
 *
 * Required env:
 *   ADMIN_PASSWORD_HASH   bcrypt hash (generate with: node scripts/hash.js <password>)
 *   ADMIN_SESSION_SECRET  iron-session cookie secret (≥32 chars)
 *
 * If ADMIN_PASSWORD_HASH is missing, login always fails (admin is locked).
 */

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { sessionOptions, AdminSession } from "./session";

export type { AdminSession };
export { sessionOptions };

export async function getSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

export async function requireAdmin(): Promise<AdminSession> {
  const s = await getSession();
  if (!s.loggedIn) throw new Error("UNAUTHENTICATED");
  return s;
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    console.warn("[auth] ADMIN_PASSWORD_HASH not set — admin is locked.");
    return false;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
