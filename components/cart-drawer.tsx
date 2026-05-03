"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart, cartTotals, checkoutOnEasyOrders, checkoutOnWhatsApp } from "@/lib/cart";

export function CartDrawer() {
  const { lines, isOpen, closeCart, removeLine, setQty } = useCart();
  const { subtotal, itemCount } = cartTotals(lines);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeCart}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-ivory text-ink shadow-cinematic transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        <header className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <p className="eyebrow">Cart</p>
            <p className="text-sm font-bold">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
          </div>
          <button onClick={closeCart} aria-label="Close cart" className="text-2xl leading-none">×</button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-base opacity-70">Your cart is empty.</p>
              <Link href="/collections/hoodies" onClick={closeCart} className="btn-pill btn-pill-primary mt-6">Shop hoodies</Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4">
                  <div
                    className="h-24 w-20 flex-shrink-0 rounded-sm bg-ink bg-cover bg-center"
                    style={{ backgroundImage: `url(${l.image})` }}
                    aria-hidden
                  />
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-bold">{l.title}</p>
                    {l.variantLabel && <p className="mt-1 text-xs opacity-60">{l.variantLabel}</p>}
                    <p className="mt-2 text-sm font-bold text-burgundy">{l.price * l.qty} EGP</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-ink/20">
                        <button onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease" className="px-3 py-1 text-sm">−</button>
                        <span className="px-2 text-sm tabular-nums">{l.qty}</span>
                        <button onClick={() => setQty(l.key, l.qty + 1)} aria-label="Increase" className="px-3 py-1 text-sm">+</button>
                      </div>
                      <button onClick={() => removeLine(l.key)} aria-label="Remove" className="text-xs underline opacity-60 hover:opacity-100">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-ink/10 px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-70">Subtotal</span>
              <span className="text-lg font-extrabold">{subtotal} EGP</span>
            </div>
            <p className="mt-1 text-xs opacity-60">Shipping calculated at checkout. Try before you pay.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => checkoutOnWhatsApp(lines)} className="btn-pill btn-pill-primary justify-center">
                Checkout on WhatsApp
              </button>
              <button onClick={() => checkoutOnEasyOrders(lines)} className="btn-pill btn-pill-outline justify-center">
                Continue on EasyOrders
              </button>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}
