import type { Metadata } from "next";

/**
 * /links — bio Linktree replacement.
 * Use this URL in IG/TikTok/FB bios so all traffic hits a branded surface
 * and conversion attribution stays inside our domain (Pixel + GA fire here).
 */
export const metadata: Metadata = {
  title: "VIDDA WEAR — Links",
  description: "Pre-order Summer '26, shop hoodies, WhatsApp us, and more.",
  robots: { index: false, follow: true },
};

const LINKS = [
  { label: "🛒 Pre-order Summer ’26", href: "/pages/summer-26", accent: true },
  { label: "🥷 Shop Hoodies",          href: "/collections/hoodies" },
  { label: "🩳 Shop Pants",            href: "/collections/pants" },
  { label: "⭐ Customer Reviews",       href: "/#reviews" },
  { label: "📦 Try Before You Pay",     href: "/pages/faq#tbpy" },
  { label: "📏 Sizing Helper",          href: "/pages/faq#sizing" },
  { label: "💬 WhatsApp us",            href: "https://wa.me/201050027773", external: true },
  { label: "📱 Instagram @vidda.wear",  href: "https://www.instagram.com/vidda.wear", external: true },
  { label: "🎵 TikTok @vidda.wear",     href: "https://www.tiktok.com/@vidda.wear", external: true },
];

export default function LinksPage() {
  return (
    <section className="bg-ink min-h-screen text-ivory">
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="mx-auto h-24 w-24 overflow-hidden rounded-full ring-2 ring-burgundy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://files.easy-orders.net/1770675406046305268.jpeg" alt="VIDDA WEAR" className="h-full w-full object-cover" />
        </div>
        <p className="mt-5 text-sm tracking-eyebrow uppercase opacity-70">Heavyweight streetwear</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tightest">VIDDA WEAR</h1>
        <p className="mt-2 text-sm opacity-70">Built in Alexandria — try before you pay.</p>

        <div className="mt-10 flex flex-col gap-3">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className={`block rounded-full border px-5 py-4 text-sm font-bold tracking-wide transition ${
                l.accent
                  ? "border-burgundy bg-burgundy text-white hover:bg-[#a30028]"
                  : "border-white/30 hover:border-white"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
