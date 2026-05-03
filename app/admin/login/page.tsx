"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) router.replace(next);
      else setError(data.error || "Wrong password");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 text-ivory">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-sm bg-white/5 p-8 backdrop-blur-sm">
        <p className="eyebrow !text-burgundy">VIDDA · Admin</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tightest">Sign in</h1>
        <label className="mt-6 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">Password</label>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-sm border border-white/20 bg-white/5 px-4 py-3 text-base focus:border-burgundy focus:outline-none"
        />
        {error && <p className="mt-3 text-sm text-burgundy">{error}</p>}
        <button type="submit" disabled={loading} className="btn-pill btn-pill-primary mt-6 w-full justify-center disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-6 text-center text-xs opacity-50">
          Configure ADMIN_PASSWORD_HASH in env. <code>node scripts/hash.js &lt;password&gt;</code>
        </p>
      </form>
    </div>
  );
}
