"use client";

import { useState } from "react";

interface Props {
  source: string;
  /** Visual style — `dark` for ink backgrounds, `light` for ivory */
  variant?: "dark" | "light";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function EmailSignup({
  source,
  variant = "dark",
  eyebrow = "Insider list",
  title = "Be first. Stay ready.",
  subtitle = "Get a private link to pre-order Summer ’26 24 hours before public launch.",
  cta = "Send me the link",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, locale: typeof navigator !== "undefined" ? navigator.language : "ar-EG" }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        setMessage("You’re in. We’ll send the private pre-order link the moment it’s live.");
        setEmail("");
        // Fire analytics if Pixel/GA is present (set up in M5)
        if (typeof window !== "undefined") {
          interface AnalyticsWindow {
            gtag?: (...args: unknown[]) => void;
            fbq?: (...args: unknown[]) => void;
          }
          const w = window as unknown as AnalyticsWindow;
          w.gtag?.("event", "subscribe", { source });
          w.fbq?.("track", "Subscribe", { source });
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try WhatsApp instead.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection issue. Try WhatsApp instead.");
    }
  };

  const isDark = variant === "dark";
  const eyebrowCls = isDark ? "!text-burgundy" : "";
  const titleCls = isDark ? "text-white" : "text-ink";
  const subCls = isDark ? "text-white/80" : "text-ink/70";
  const inputCls = isDark
    ? "border-white/20 bg-white/5 text-white placeholder:text-white/40"
    : "border-ink/20 bg-white text-ink placeholder:text-ink/40";

  return (
    <div className={isDark ? "bg-ink text-white" : "bg-ivory text-ink"}>
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className={`eyebrow ${eyebrowCls}`}>{eyebrow}</p>
        <h2 className={`mt-3 text-3xl font-extrabold tracking-tightest md:text-5xl ${titleCls}`}>{title}</h2>
        <p className={`mx-auto mt-4 max-w-xl leading-7 ${subCls}`}>{subtitle}</p>

        <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor={`email-${source}`}>Email</label>
          <input
            id={`email-${source}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={status === "loading" || status === "success"}
            className={`flex-1 rounded-full border px-5 py-3 text-base focus:border-burgundy focus:outline-none ${inputCls}`}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="btn-pill btn-pill-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : status === "success" ? "You’re in" : cta}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${status === "success" ? "text-burgundy" : isDark ? "text-white/70" : "text-ink/70"}`}>
            {message}
          </p>
        )}

        <p className={`mt-3 text-xs ${isDark ? "text-white/50" : "text-ink/50"}`}>
          No spam. Unsubscribe anytime. Or DM <a href="https://wa.me/201050027773" target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a> for direct updates.
        </p>
      </div>
    </div>
  );
}
