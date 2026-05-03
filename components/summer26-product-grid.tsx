"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

interface SummerPiece {
  id: string;
  slug: string;
  name: string;
  price: number;
  sizes: string[];
  image: string;
  badge?: string;
}

/**
 * Summer '26 placeholder catalog.
 * Real SKUs land here in M3.5 once your shoot is in and EO has the SKUs registered.
 * Each piece has a size selector and routes through the same cart drawer used everywhere.
 */
const PIECES: SummerPiece[] = [
  { id: "s26-oversized-tee",  slug: "s26-oversized-tee",   name: "Oversized Tee",        price: 599, sizes: ["S","M","L","XL"], image: "https://files.easy-orders.net/1777153929129049238.png", badge: "First-batch only" },
  { id: "s26-boxy-tee",       slug: "s26-boxy-tee",        name: "Boxy Tee",             price: 549, sizes: ["S","M","L","XL"], image: "https://files.easy-orders.net/1777153929229665030.png" },
  { id: "s26-light-hoodie",   slug: "s26-light-hoodie",    name: "Lightweight Hoodie",   price: 799, sizes: ["S","M","L","XL"], image: "https://files.easy-orders.net/1777153927881420196.png", badge: "Insider favorite" },
  { id: "s26-linen-shorts",   slug: "s26-linen-shorts",    name: "Linen Shorts",         price: 549, sizes: ["S","M","L","XL"], image: "https://files.easy-orders.net/1777153928233560405.png" },
  { id: "s26-tank",           slug: "s26-tank",            name: "Tank Top",             price: 399, sizes: ["S","M","L","XL"], image: "https://files.easy-orders.net/1777153929129049238.png" },
  { id: "s26-set",            slug: "s26-set",             name: "Summer Set (tee + shorts)", price: 899, sizes: ["S","M","L","XL"], image: "https://files.easy-orders.net/1777153929229665030.png", badge: "Best value" },
];

export function Summer26ProductGrid() {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-3">
      {PIECES.map((p) => <PieceCard key={p.id} piece={p} />)}
    </div>
  );
}

function PieceCard({ piece }: { piece: SummerPiece }) {
  const [size, setSize] = useState<string>(piece.sizes[1] ?? piece.sizes[0]);
  const addLine = useCart((s) => s.addLine);

  const onAdd = () => {
    addLine({
      key: `${piece.slug}::Size=${size}`,
      productSlug: piece.slug,
      title: `VIDDA Summer ’26 · ${piece.name}`,
      price: piece.price,
      qty: 1,
      image: piece.image,
      variantLabel: `Size: ${size}`,
      options: { Size: size },
    });
  };

  return (
    <article className="rounded-sm border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
      <div
        className="relative aspect-[4/5] w-full rounded-sm bg-ink bg-cover bg-center"
        style={{ backgroundImage: `url(${piece.image})` }}
        role="img"
        aria-label={piece.name}
      >
        {piece.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-burgundy px-3 py-1 text-[10px] font-bold uppercase tracking-eyebrow text-white">
            {piece.badge}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-base font-bold">{piece.name}</h3>
        <span className="text-base font-extrabold text-burgundy">{piece.price} EGP</span>
      </div>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-eyebrow opacity-60">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {piece.sizes.map((s) => {
            const active = s === size;
            return (
              <button
                key={s}
                onClick={() => setSize(s)}
                aria-pressed={active}
                className={`min-w-10 rounded-full border px-3 py-1 text-xs font-bold transition ${
                  active ? "border-burgundy bg-burgundy text-white" : "border-white/30 hover:border-white"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onAdd} className="btn-pill btn-pill-primary mt-5 w-full justify-center">
        Reserve {size}
      </button>
    </article>
  );
}
