/**
 * Edge-safe session config (no Node modules).
 * Both middleware (Edge runtime) and lib/auth.ts (Node runtime) import this.
 */
import { SessionOptions } from "iron-session";

export interface AdminSession {
  loggedIn?: boolean;
  user?: { id: "admin" };
  loggedInAt?: number;
}

const DEV_SECRET = "vidda-dev-only-replace-in-prod-with-random-32+-chars-please-do-it";

export function sessionOptions(): SessionOptions {
  const secret = process.env.ADMIN_SESSION_SECRET ?? DEV_SECRET;
  return {
    password: secret,
    cookieName: "vidda_admin",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}
