"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EOProduct } from "@/lib/easyorders";

type SortKey = "featured" | "price-asc" | "price-desc" | "title";

export function CollectionGrid({ products }: { products: EOProduct[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    if (products.length === 0) return 5000;
    return Math.max(...products.map((p) => p.price));
  });
  const priceCeiling = useMemo(() => {
    if (products.length === 0) return 5000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !(p.title_ar || "").toLowerCase().includes(q)) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, query, sort, maxPrice]);

  return (
    <>
      <div className="mt-8 grid gap-4 rounded-sm border border-ink/10 bg-white/60 p-4 md:grid-cols-3">
        <label className="block">
          <span className="eyebrow">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hoodie, pants, summer…"
            className="mt-2 block w-full rounded-full border border-ink/20 bg-white px-4 py-2 text-sm focus:border-burgundy focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="mt-2 block w-full rounded-full border border-ink/20 bg-white px-4 py-2 text-sm focus:border-burgundy focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price · Low to high</option>
            <option value="price-desc">Price · High to low</option>
            <option value="title">Alphabetical</option>
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Max price · {maxPrice} EGP</span>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={50}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="mt-3 block w-full accent-[#800020]"
          />
        </label>
      </div>

      <div className="mt-3 text-xs opacity-60">
        {filtered.length} of {products.length} {products.length === 1 ? "product" : "products"}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="opacity-70">No products match your filters.</p>
        ) : (
          filtered.map((p) => (
            <Link key={p.id} href={`/products/${p.slug}`} className="group block">
              <div
                className="aspect-[4/5] w-full rounded-sm bg-ink bg-cover bg-center transition group-hover:scale-[1.01]"
                style={{ backgroundImage: `url(${p.images[0]?.src})` }}
              />
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold">{p.title}</span>
                <span className="font-bold text-burgundy">{p.price} EGP</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
