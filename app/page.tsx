import Link from "next/link";
import { getProducts } from "@/lib/easyorders";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-ivory">
        <div className="mx-auto grid max-w-wrap items-center gap-10 px-5 py-24 md:grid-cols-2">
          <div>
            <p className="eyebrow !text-burgundy">VIDDA WEAR</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-tight tracking-tightest md:text-7xl">
              Heavyweight streetwear.<br />
              Built in Alexandria.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-7 opacity-80">
              400 GSM. Egyptian cotton. Try before you pay — every governorate.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pages/summer-26" className="btn-pill btn-pill-primary">
                Pre-order Summer ’26
              </Link>
              <Link href="/collections/hoodies" className="btn-pill btn-pill-outline !text-ivory !border-ivory hover:!bg-ivory hover:!text-ink">
                Shop Hoodies
              </Link>
            </div>
          </div>
          <div className="aspect-[4/5] w-full rounded-sm bg-cover bg-center shadow-cinematic" style={{ backgroundImage: "url(https://files.easy-orders.net/1777153928233560405.png)" }} />
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-wrap px-5 py-24">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="eyebrow">Shop the heavyweight line</p>
              <h2 className="mt-2 text-4xl font-extrabold tracking-tightest md:text-5xl">Built for presence.</h2>
            </div>
            <Link href="/collections/hoodies" className="hidden text-sm font-semibold underline md:block">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {products.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group block">
                <div
                  className="aspect-[4/5] w-full rounded-sm bg-ink bg-cover bg-center transition-transform group-hover:scale-[1.01]"
                  style={{ backgroundImage: `url(${p.images[0]?.src})` }}
                  aria-label={p.title}
                />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold">{p.title}</span>
                  <span className="font-bold text-burgundy">{p.price} EGP</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TBPY band */}
      <section className="bg-ink text-ivory">
        <div className="mx-auto grid max-w-wrap gap-10 px-5 py-20 md:grid-cols-3">
          {[
            { eyebrow: "Try Before You Pay", body: "Open the box, try it on, then pay. Cash on delivery, every governorate." },
            { eyebrow: "14-Day Returns", body: "Size off? We collect, swap or refund. No restocking fees." },
            { eyebrow: "Fast Shipping", body: "Cairo + Alex: 1–2 days. Other governorates: 2–4 days." },
          ].map((b) => (
            <div key={b.eyebrow}>
              <p className="eyebrow">{b.eyebrow}</p>
              <p className="mt-3 text-base leading-7 opacity-80">{b.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
