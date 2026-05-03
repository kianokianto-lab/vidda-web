"use client";

import { useCart, cartTotals } from "@/lib/cart";
import { useEffect, useState } from "react";

export function CartButton() {
  const { lines, openCart } = useCart();
  const { itemCount } = cartTotals(lines);
  // Avoid SSR/CSR mismatch: render the badge only after mount, since itemCount comes from localStorage.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={openCart}
      aria-label={`Open cart (${itemCount} items)`}
      className="btn-pill btn-pill-primary !py-2 !px-4 !text-[11px] relative"
    >
      Cart
      {mounted && itemCount > 0 && (
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-burgundy">
          {itemCount}
        </span>
      )}
    </button>
  );
}
