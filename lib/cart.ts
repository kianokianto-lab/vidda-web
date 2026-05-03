"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartLine {
  /** Stable id used for line dedup: `${productSlug}::${variantKey}` */
  key: string;
  productSlug: string;
  title: string;
  price: number;
  qty: number;
  image: string;
  /** e.g. "Size: M · Color: Black" */
  variantLabel?: string;
  /** Variant selections, used by the EasyOrders checkout handoff */
  options?: Record<string, string>;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addLine: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  removeLine: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      addLine: (line) =>
        set((s) => {
          const qty = line.qty ?? 1;
          const existing = s.lines.find((l) => l.key === line.key);
          const next = existing
            ? s.lines.map((l) => (l.key === line.key ? { ...l, qty: l.qty + qty } : l))
            : [...s.lines, { ...line, qty }];
          return { lines: next, isOpen: true };
        }),
      removeLine: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.key === key ? { ...l, qty: Math.max(0, qty) } : l))
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "vidda-cart-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : ({} as Storage))),
      partialize: (state) => ({ lines: state.lines }),
    }
  )
);

export const cartTotals = (lines: CartLine[]) => {
  const subtotal = lines.reduce((acc, l) => acc + l.price * l.qty, 0);
  const itemCount = lines.reduce((acc, l) => acc + l.qty, 0);
  return { subtotal, itemCount };
};

/**
 * Hand off to EasyOrders checkout.
 * EO doesn't expose a documented "create cart" API, so we redirect each line
 * to its product page on the live storefront. The user picks their variant in EO's UI
 * and submits via Try Before You Pay. Once we have a documented EO order webhook
 * (or we move to Stripe in M4), this becomes a direct POST.
 */
export const checkoutOnEasyOrders = (lines: CartLine[]) => {
  if (lines.length === 0) return;
  // For now: open the first line's product page (and offer WhatsApp as fallback in the drawer).
  const first = lines[0];
  window.open(
    `https://www.viddawear.store/products/${first.productSlug}`,
    "_blank",
    "noopener,noreferrer"
  );
};

/**
 * WhatsApp checkout: pre-fill a structured order message.
 * High-converting fallback for cash-on-delivery orders without an EO API call.
 */
export const checkoutOnWhatsApp = (lines: CartLine[]) => {
  if (lines.length === 0) return;
  const total = lines.reduce((acc, l) => acc + l.price * l.qty, 0);
  const itemsBlock = lines
    .map((l, i) => {
      const variant = l.variantLabel ? ` (${l.variantLabel})` : "";
      return `${i + 1}. ${l.title}${variant} — Qty ${l.qty} — ${l.price * l.qty} EGP`;
    })
    .join("\n");
  const message = `Hello VIDDA — I'd like to order:\n\n${itemsBlock}\n\nTotal: ${total} EGP\n(Try Before You Pay — I'll provide my shipping details on chat.)`;
  const url = `https://wa.me/201050027773?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
};
