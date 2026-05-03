"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart, cartTotals, checkoutOnEasyOrders } from "@/lib/cart";

type PaymentMethod = "cod" | "whatsapp" | "easyorders" | "stripe";
type Status = "idle" | "submitting" | "success" | "error";

interface FormState {
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  governorate: string;
  notes: string;
}

const STRIPE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_STRIPE === "1";

const GOVERNORATES = [
  "Cairo","Giza","Alexandria","Qalyubia","Sharqia","Dakahlia","Gharbia","Monufia","Beheira","Kafr El Sheikh",
  "Damietta","Port Said","Ismailia","Suez","North Sinai","South Sinai","Red Sea","Faiyum","Beni Suef","Minya",
  "Asyut","Sohag","Qena","Luxor","Aswan","New Valley","Matruh",
];

export function CheckoutClient() {
  const { lines, clear } = useCart();
  const { subtotal, itemCount } = cartTotals(lines);

  const [form, setForm] = useState<FormState>({
    name: "", phone: "", email: "",
    line1: "", line2: "", city: "", governorate: "Cairo", notes: "",
  });
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");

  // Persist form across reloads (basic UX win, not security-sensitive)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vidda-checkout-form");
      if (saved) setForm((f) => ({ ...f, ...JSON.parse(saved) }));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem("vidda-checkout-form", JSON.stringify(form)); } catch { /* ignore */ }
  }, [form]);

  const onField = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const formValid = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      /^[+0-9\s-]{8,}$/.test(form.phone) &&
      form.line1.trim().length >= 3 &&
      form.city.trim().length >= 2 &&
      form.governorate.trim().length >= 2 &&
      lines.length > 0
    );
  }, [form, lines.length]);

  const submitCod = async () => {
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || undefined,
            address: {
              line1: form.line1.trim(),
              line2: form.line2.trim() || undefined,
              city: form.city.trim(),
              governorate: form.governorate.trim(),
              country: "EG",
            },
            notes: form.notes.trim() || undefined,
          },
          lines: lines.map((l) => ({
            productSlug: l.productSlug,
            title: l.title,
            qty: l.qty,
            price: l.price,
            variantLabel: l.variantLabel,
            options: l.options,
          })),
          paymentMethod: "cod",
          source: "web-checkout",
          locale: typeof navigator !== "undefined" ? navigator.language : "ar-EG",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setOrderId(data.order.id);
        setStatus("success");
        clear();
        // Analytics
        if (typeof window !== "undefined") {
          interface AnalyticsWindow { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; }
          const w = window as unknown as AnalyticsWindow;
          w.gtag?.("event", "purchase", { transaction_id: data.order.id, value: data.order.total, currency: "EGP" });
          w.fbq?.("track", "Purchase", { value: data.order.total, currency: "EGP", contents: lines });
        }
      } else {
        setStatus("error"); setError(data.error || "Order failed");
      }
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Network error");
    }
  };

  const handleWhatsapp = () => {
    // Final WhatsApp message includes shipping + name + total
    const total = subtotal;
    const itemsBlock = lines.map((l, i) => {
      const variant = l.variantLabel ? ` (${l.variantLabel})` : "";
      return `${i + 1}. ${l.title}${variant} — ×${l.qty} — ${l.qty * l.price} EGP`;
    }).join("\n");
    const addr = [form.line1, form.line2, form.city, form.governorate].filter(Boolean).join(", ");
    const msg = [
      "Hello VIDDA — I'd like to place an order:",
      "",
      itemsBlock,
      "",
      `Total: ${total} EGP`,
      "Pay on delivery (Try Before You Pay)",
      form.name ? `Name: ${form.name}` : "",
      form.phone ? `Phone: ${form.phone}` : "",
      addr ? `Address: ${addr}` : "",
      form.notes ? `Notes: ${form.notes}` : "",
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/201050027773?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (status === "success") {
    return (
      <div className="rounded-sm border border-ink/10 bg-white p-10 text-center">
        <p className="eyebrow !text-burgundy">Order placed</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tightest md:text-4xl">Thank you. We&rsquo;re on it.</h2>
        <p className="mx-auto mt-4 max-w-md leading-7 opacity-80">
          Order ID <strong className="text-burgundy">{orderId}</strong>. We&rsquo;ll WhatsApp you within 24 hours to confirm the delivery window. Try the pieces before you pay.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-pill btn-pill-primary">Back to home</Link>
          <a href="https://wa.me/201050027773" target="_blank" rel="noopener noreferrer" className="btn-pill btn-pill-outline">DM WhatsApp</a>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-sm border border-ink/10 bg-white p-10 text-center">
        <p className="text-base opacity-70">Your cart is empty.</p>
        <Link href="/collections/hoodies" className="btn-pill btn-pill-primary mt-6">Shop hoodies</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr,360px]">
      {/* Left: form */}
      <div className="space-y-6">
        <div className="rounded-sm border border-ink/10 bg-white p-6">
          <h2 className="text-lg font-extrabold">1. Contact</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Full name" value={form.name} onChange={(v) => onField("name", v)} required />
            <Field label="Phone (WhatsApp preferred)" value={form.phone} onChange={(v) => onField("phone", v)} required type="tel" />
            <Field label="Email (optional)" value={form.email} onChange={(v) => onField("email", v)} type="email" wide />
          </div>
        </div>

        <div className="rounded-sm border border-ink/10 bg-white p-6">
          <h2 className="text-lg font-extrabold">2. Shipping</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Address line 1" value={form.line1} onChange={(v) => onField("line1", v)} required wide />
            <Field label="Address line 2 (optional)" value={form.line2} onChange={(v) => onField("line2", v)} wide />
            <Field label="City" value={form.city} onChange={(v) => onField("city", v)} required />
            <div className="md:col-span-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">Governorate</label>
              <select
                value={form.governorate}
                onChange={(e) => onField("governorate", e.target.value)}
                className="w-full rounded-sm border border-ink/20 bg-white px-4 py-3 text-base focus:border-burgundy focus:outline-none"
              >
                {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <Field label="Notes (delivery time, landmarks)" value={form.notes} onChange={(v) => onField("notes", v)} wide />
          </div>
        </div>

        <div className="rounded-sm border border-ink/10 bg-white p-6">
          <h2 className="text-lg font-extrabold">3. Payment</h2>
          <div className="mt-4 space-y-3">
            <PaymentOption
              id="cod" current={method} setCurrent={setMethod}
              title="Cash on delivery (Try Before You Pay)"
              subtitle="Try the pieces, then pay the courier. Recommended."
              recommended
            />
            <PaymentOption
              id="whatsapp" current={method} setCurrent={setMethod}
              title="Continue on WhatsApp"
              subtitle="We confirm sizes + address with you on chat. Pay on delivery."
            />
            <PaymentOption
              id="easyorders" current={method} setCurrent={setMethod}
              title="Continue on EasyOrders storefront"
              subtitle="Open your cart on the live storefront and finish there."
            />
            <PaymentOption
              id="stripe" current={method} setCurrent={setMethod}
              title="Card (Stripe)"
              subtitle={STRIPE_ENABLED ? "Secure payment via Stripe." : "Coming soon — enable on request."}
              disabled={!STRIPE_ENABLED}
            />
          </div>
        </div>

        {error && <p className="rounded-sm bg-burgundy/10 px-4 py-3 text-sm text-burgundy">{error}</p>}
      </div>

      {/* Right: order summary */}
      <aside className="space-y-4 md:sticky md:top-24 md:self-start">
        <div className="rounded-sm border border-ink/10 bg-white p-6">
          <h2 className="text-lg font-extrabold">Order summary</h2>
          <p className="mt-1 text-xs opacity-60">{itemCount} {itemCount === 1 ? "item" : "items"}</p>

          <ul className="mt-4 space-y-3">
            {lines.map((l) => (
              <li key={l.key} className="flex gap-3">
                <div className="h-16 w-14 flex-shrink-0 rounded-sm bg-ink bg-cover bg-center" style={{ backgroundImage: `url(${l.image})` }} aria-hidden />
                <div className="flex flex-1 flex-col text-sm">
                  <span className="font-bold">{l.title}</span>
                  {l.variantLabel && <span className="text-xs opacity-60">{l.variantLabel}</span>}
                  <span className="mt-1 opacity-70">×{l.qty}</span>
                </div>
                <span className="font-bold text-burgundy">{l.price * l.qty} EGP</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><span className="opacity-70">Subtotal</span><span className="font-bold">{subtotal} EGP</span></div>
            <div className="flex justify-between"><span className="opacity-70">Shipping</span><span className="opacity-60">Calculated on confirm</span></div>
            <div className="mt-3 flex justify-between text-base"><span className="font-bold">Total</span><span className="font-extrabold text-burgundy">{subtotal} EGP</span></div>
          </div>

          <button
            onClick={() => {
              if (method === "whatsapp") return handleWhatsapp();
              if (method === "easyorders") return checkoutOnEasyOrders(lines);
              if (method === "stripe") return; // disabled in M4
              return submitCod();
            }}
            disabled={!formValid || status === "submitting" || (method === "stripe" && !STRIPE_ENABLED)}
            className="btn-pill btn-pill-primary mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {method === "cod" && (status === "submitting" ? "Placing order…" : "Place order (pay on delivery)")}
            {method === "whatsapp" && "Open WhatsApp with cart"}
            {method === "easyorders" && "Continue on EasyOrders →"}
            {method === "stripe" && (STRIPE_ENABLED ? "Pay with card" : "Card payment coming soon")}
          </button>
          {/* Fallback link to WhatsApp regardless of method */}
          <button onClick={handleWhatsapp} className="mt-2 w-full text-xs underline opacity-60 hover:opacity-100">
            Or send the cart to WhatsApp without placing an order
          </button>
        </div>
        <p className="text-center text-xs opacity-60">By placing an order you agree to our Try Before You Pay policy: open the box, try the pieces, then pay the courier.</p>
      </aside>
    </div>
  );
}

function Field({
  label, value, onChange, required, type = "text", wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">
        {label}{required && <span className="text-burgundy"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-sm border border-ink/20 bg-white px-4 py-3 text-base focus:border-burgundy focus:outline-none"
      />
    </label>
  );
}

function PaymentOption({
  id, current, setCurrent, title, subtitle, recommended, disabled,
}: {
  id: PaymentMethod;
  current: PaymentMethod;
  setCurrent: (m: PaymentMethod) => void;
  title: string;
  subtitle: string;
  recommended?: boolean;
  disabled?: boolean;
}) {
  const active = current === id;
  return (
    <button
      type="button"
      onClick={() => !disabled && setCurrent(id)}
      disabled={disabled}
      aria-pressed={active}
      className={`flex w-full items-start gap-3 rounded-sm border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "border-burgundy bg-burgundy/5" : "border-ink/15 hover:border-ink/30"
      }`}
    >
      <span className={`mt-1 h-4 w-4 flex-shrink-0 rounded-full border-2 ${active ? "border-burgundy bg-burgundy" : "border-ink/30"}`} aria-hidden />
      <span className="flex-1">
        <span className="flex items-center gap-2 font-bold">
          {title}
          {recommended && <span className="rounded-full bg-burgundy px-2 py-0.5 text-[10px] font-bold uppercase tracking-eyebrow text-white">Recommended</span>}
        </span>
        <span className="mt-1 block text-sm opacity-70">{subtitle}</span>
      </span>
    </button>
  );
}
