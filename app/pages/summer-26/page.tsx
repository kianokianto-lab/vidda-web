import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Summer ’26 — Pre-order",
  description: "VIDDA Summer ’26 — heavyweight identity, summer-cut. Pre-order open. Built in Alexandria.",
  alternates: { canonical: "/pages/summer-26" },
};

const IMG_HERO = "https://files.easy-orders.net/1777153928233560405.png";
const IMG_LIFE = [
  "https://files.easy-orders.net/1777153929129049238.png",
  "https://files.easy-orders.net/1777153929229665030.png",
  "https://files.easy-orders.net/1777153927881420196.png",
];

export default function Summer26() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-ink text-ivory">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${IMG_HERO})` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-wrap px-5 py-32 text-center">
          <p className="eyebrow !text-burgundy">VIDDA · Summer ’26</p>
          <h1 className="mt-3 text-5xl font-extrabold tracking-tightest md:text-7xl">Heavyweight identity. Summer-cut.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-7 opacity-90">
            Six pieces engineered for the Mediterranean heat — without losing the weight that makes VIDDA, VIDDA.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="#preorder" className="btn-pill btn-pill-primary">Reserve your size</Link>
            <Link href="#story" className="btn-pill btn-pill-outline !text-ivory !border-ivory">Watch the film</Link>
          </div>
        </div>
      </section>

      {/* Lifestyle blocks */}
      <section id="story" className="bg-ivory">
        <div className="mx-auto grid max-w-wrap gap-1 px-1 py-1 md:grid-cols-3">
          {IMG_LIFE.map((src) => (
            <div key={src} className="aspect-[3/4] w-full bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} />
          ))}
        </div>
      </section>

      {/* Pre-order placeholder grid (real SKUs land here once admin is updated) */}
      <section id="preorder" className="bg-ink text-ivory">
        <div className="mx-auto max-w-wrap px-5 py-24">
          <p className="eyebrow !text-burgundy text-center">Pre-order open · Limited run</p>
          <h2 className="mt-2 text-center text-4xl font-extrabold tracking-tightest md:text-5xl">Six pieces. One drop.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { name: "Oversized Tee", price: "599 EGP" },
              { name: "Boxy Tee", price: "549 EGP" },
              { name: "Lightweight Hoodie", price: "799 EGP" },
              { name: "Linen Shorts", price: "549 EGP" },
              { name: "Tank Top", price: "399 EGP" },
              { name: "Summer Set", price: "899 EGP" },
            ].map((p) => (
              <div key={p.name} className="rounded-sm border border-white/10 p-5">
                <div className="aspect-[4/5] w-full rounded-sm bg-white/5" />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold">{p.name}</span>
                  <span className="font-bold text-burgundy">{p.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
