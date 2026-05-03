"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import type { EOProduct } from "@/lib/easyorders";

export function ProductBuyBox({ product }: { product: EOProduct }) {
  const addLine = useCart((s) => s.addLine);
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const opt of product.options || []) {
      if (opt.values[0]) initial[opt.name] = opt.values[0];
    }
    return initial;
  });
  const [qty, setQty] = useState(1);

  const allSelected = (product.options || []).every((o) => Boolean(selections[o.name]));

  const variantLabel = useMemo(() => {
    const entries = Object.entries(selections).filter(([, v]) => v);
    return entries.map(([k, v]) => `${k}: ${v}`).join(" · ") || undefined;
  }, [selections]);

  const variantKey = useMemo(() => {
    const entries = Object.entries(selections).filter(([, v]) => v).sort();
    return entries.map(([k, v]) => `${k}=${v}`).join("|") || "default";
  }, [selections]);

  const onAdd = () => {
    if (!allSelected) return;
    addLine({
      key: `${product.slug}::${variantKey}`,
      productSlug: product.slug,
      title: product.title,
      price: product.price,
      qty,
      image: product.images[0]?.src ?? "",
      variantLabel,
      options: { ...selections },
    });
  };

  return (
    <div className="mt-8">
      {(product.options || []).map((opt) => (
        <div key={opt.name} className="mt-5">
          <p className="eyebrow">{opt.name}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {opt.values.map((v) => {
              const active = selections[opt.name] === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelections((s) => ({ ...s, [opt.name]: v }))}
                  aria-pressed={active}
                  className={`min-w-12 rounded-full border px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "border-burgundy bg-burgundy text-white"
                      : "border-ink/20 hover:border-ink"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-6 flex items-center gap-3">
        <p className="eyebrow">Quantity</p>
        <div className="flex items-center rounded-full border border-ink/20">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity" className="px-3 py-1.5 text-sm">−</button>
          <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
          <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity" className="px-3 py-1.5 text-sm">+</button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onAdd}
          disabled={!allSelected || !product.in_stock}
          className="btn-pill btn-pill-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {product.in_stock ? "Add to cart" : "Out of stock"}
        </button>
        <a
          href={`https://wa.me/201050027773?text=${encodeURIComponent("Hi, I want to order: " + product.title + (variantLabel ? " (" + variantLabel + ")" : ""))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill btn-pill-outline"
        >
          WhatsApp us
        </a>
      </div>
      <p className="mt-4 text-sm opacity-70">
        Try before you pay · 14-day returns · Cash on delivery, every governorate
      </p>
    </div>
  );
}
