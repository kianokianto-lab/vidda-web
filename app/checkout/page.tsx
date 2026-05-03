import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your VIDDA WEAR order. Cash on delivery, WhatsApp, or EasyOrders.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tightest md:text-5xl">Complete your order</h1>
        <p className="mt-3 max-w-xl text-base leading-7 opacity-70">
          Three ways to finish: pay on delivery (Try Before You Pay), continue on WhatsApp, or open your cart on the EasyOrders storefront.
        </p>
        <div className="mt-10">
          <CheckoutClient />
        </div>
      </div>
    </section>
  );
}
