"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DbProduct } from "@/lib/repos";

interface Props { product?: DbProduct }

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: product?.slug ?? "",
    title: product?.title ?? "",
    title_ar: product?.title_ar ?? "",
    price: product?.price ?? 0,
    price_before: product?.price_before ?? 0,
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    in_stock: product?.in_stock ?? true,
    images_text: (product?.images ?? []).map((i) => i.src).join("\n"),
    options_text: JSON.stringify(product?.options ?? [{ name: "Size", values: ["S", "M", "L", "XL"] }], null, 2),
  });
  const [status, setStatus] = useState<"idle" | "saving" | "deleting" | "error">("idle");
  const [error, setError] = useState("");

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const body = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        title_ar: form.title_ar.trim() || null,
        price: Number(form.price),
        price_before: form.price_before ? Number(form.price_before) : null,
        description: form.description.trim() || null,
        sku: form.sku.trim() || null,
        in_stock: form.in_stock,
        images: form.images_text.split("\n").map((s) => s.trim()).filter(Boolean).map((src) => ({ src })),
        options: JSON.parse(form.options_text),
      };
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.ok) { router.push("/admin/products"); router.refresh(); }
      else { setStatus("error"); setError(data.error || "Save failed"); }
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Save failed");
    }
  };

  const onDelete = async () => {
    if (!product || !confirm(`Delete "${product.title}"?`)) return;
    setStatus("deleting");
    const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) { router.push("/admin/products"); router.refresh(); }
    else { setStatus("error"); setError(data.error || "Delete failed"); }
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      <Card title="Basics">
        <Grid>
          <Field label="Title (EN)" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <Field label="Title (AR)" value={form.title_ar} onChange={(v) => setForm({ ...form, title_ar: v })} dir="rtl" />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} required mono placeholder="vidda-classic-hoodie" />
          <Field label="SKU" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} mono />
        </Grid>
      </Card>

      <Card title="Pricing & stock">
        <Grid>
          <Field label="Price (EGP)" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) })} required />
          <Field label="Price before (EGP, optional)" type="number" value={String(form.price_before)} onChange={(v) => setForm({ ...form, price_before: Number(v) })} />
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} />
            <span>In stock</span>
          </label>
        </Grid>
      </Card>

      <Card title="Description">
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-sm border border-ink/20 bg-white px-4 py-3 text-base focus:border-burgundy focus:outline-none"
          placeholder="Heavyweight 400 GSM. Boxy fit. Built in Alexandria."
        />
      </Card>

      <Card title="Images" subtitle="One URL per line. Upload via /admin/images first.">
        <textarea
          rows={4}
          value={form.images_text}
          onChange={(e) => setForm({ ...form, images_text: e.target.value })}
          className="w-full rounded-sm border border-ink/20 bg-white px-4 py-3 text-sm font-mono focus:border-burgundy focus:outline-none"
        />
      </Card>

      <Card title="Variants" subtitle="JSON array of { name, values: [] } — e.g. Size + Color">
        <textarea
          rows={6}
          value={form.options_text}
          onChange={(e) => setForm({ ...form, options_text: e.target.value })}
          className="w-full rounded-sm border border-ink/20 bg-white px-4 py-3 text-sm font-mono focus:border-burgundy focus:outline-none"
        />
      </Card>

      {error && <p className="rounded-sm bg-burgundy/10 px-4 py-3 text-sm text-burgundy">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={status === "saving"} className="btn-pill btn-pill-primary disabled:opacity-50">
          {status === "saving" ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        {product && (
          <button type="button" onClick={onDelete} disabled={status === "deleting"} className="btn-pill btn-pill-outline border-burgundy text-burgundy disabled:opacity-50">
            {status === "deleting" ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-ink/10 bg-white p-6">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold">{title}</h2>
        {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function Field({
  label, value, onChange, type = "text", required, mono, dir, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; mono?: boolean; dir?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-eyebrow opacity-70">{label}{required && " *"}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        dir={dir} placeholder={placeholder}
        className={`w-full rounded-sm border border-ink/20 bg-white px-4 py-3 focus:border-burgundy focus:outline-none ${mono ? "font-mono text-sm" : "text-base"}`}
      />
    </label>
  );
}
