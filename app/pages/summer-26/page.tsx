import type { Metadata } from "next";
import Link from "next/link";
import { EmailSignup } from "@/components/email-signup";
import { Summer26Countdown } from "@/components/summer26-countdown";
import { Summer26ProductGrid } from "@/components/summer26-product-grid";
import { Summer26StickyCta } from "@/components/summer26-sticky-cta";

export const metadata: Metadata = {
  title: "Summer ’26 — Pre-order",
  description:
    "VIDDA Summer ’26 — heavyweight identity, summer-cut. Six pieces engineered for the Mediterranean. Pre-order open. Built in Alexandria.",
  alternates: { canonical: "/pages/summer-26" },
  openGraph: {
    title: "VIDDA Summer ’26 — Pre-order",
    description: "Six pieces. One drop. Heavyweight identity, summer-cut. Built in Alexandria.",
    type: "website",
    images: [
      { url: "https://files.easy-orders.net/1777153928233560405.png", width: 1200, height: 1500, alt: "VIDDA Summer ’26" },
    ],
  },
};

/**
 * Photo masters drop-in slots.
 * When the shoot files land, replace these URLs with /summer26/<filename>.jpg
 * (paths defined in docs/PHOTO_MASTERS.md). The LP picks them up automatically.
 */
const HERO = "https://files.easy-orders.net/1777153928233560405.png";
const GALLERY = [
  "https://files.easy-orders.net/1777153929129049238.png",
  "https://files.easy-orders.net/1777153929229665030.png",
  "https://files.easy-orders.net/1777153927881420196.png",
];

// Pre-order target. Update as the launch date locks.
const LAUNCH_AT = "2026-06-15T18:00:00+02:00";

export default function Summer26() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-ink text-ivory">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${HERO})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" aria-hidden />
        <div className="relative mx-auto max-w-wrap px-5 py-32 text-center md:py-40">
          <p className="eyebrow !text-burgundy">VIDDA · Summer ’26</p>
          <h1 className="mt-4 text-5xl font-extrabold leading-[0.95] tracking-tightest md:text-8xl">
            Heavyweight identity.<br />Summer-cut.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-7 opacity-90 md:text-xl">
            Six pieces engineered for the Mediterranean — without losing the weight that makes VIDDA, VIDDA.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="#preorder" className="btn-pill btn-pill-primary">Reserve your size</Link>
            <Link href="#story" className="btn-pill btn-pill-outline !text-ivory !border-ivory hover:!bg-ivory hover:!text-ink">
              Watch the film
            </Link>
          </div>

          {/* Countdown */}
          <div className="mt-14">
            <Summer26Countdown targetIso={LAUNCH_AT} />
          </div>
        </div>
      </section>

      {/* Manifesto / founder voice */}
      <section id="story" className="bg-ivory">
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <p className="eyebrow">A note from Alexandria</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tightest md:text-5xl">
            We don’t trade presence for price.
          </h2>
          <div className="mt-8 space-y-5 text-left text-lg leading-8 md:text-center">
            <p>
              When we started VIDDA, the brief was simple: build streetwear that <em>feels</em> before it’s seen. 400 GSM hoodies. Structured pants. Fabric that doesn’t apologize for itself.
            </p>
            <p>
              Summer in Alexandria is brutal. So Summer ’26 is the answer to one question: <strong>how do you keep the weight when the weather can’t take it?</strong>
            </p>
            <p>
              Six pieces. Tighter weave, lighter hand, same posture. Built in the same workshop. Inspected the same way. Same mark earned the same way.
            </p>
            <p className="text-burgundy font-bold">— The VIDDA team. Built in Alexandria.</p>
          </div>
        </div>
      </section>

      {/* Gallery — drop-in slots for shoot masters */}
      <section className="bg-ivory">
        <div className="mx-auto grid max-w-wrap gap-1 px-1 pb-1 md:grid-cols-3">
          {GALLERY.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[3/4] w-full overflow-hidden bg-ink bg-cover bg-center"
              style={{ backgroundImage: `url(${src})` }}
              role="img"
              aria-label={`Summer ’26 lookbook image ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Pre-order grid (real cart-wired SKUs) */}
      <section id="preorder" className="bg-ink text-ivory">
        <div className="mx-auto max-w-wrap px-5 py-24">
          <div className="text-center">
            <p className="eyebrow !text-burgundy">Pre-order open · Limited run</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tightest md:text-6xl">Six pieces. One drop.</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 opacity-80">
              First batch ships from Alexandria the week of launch. Pre-order today, lock your size, pay only on delivery.
            </p>
          </div>
          <Summer26ProductGrid />
        </div>
      </section>

      {/* Email capture — in-feed */}
      <EmailSignup
        source="summer-26-lp"
        variant="light"
        eyebrow="Insider list"
        title="Be first. Stay ready."
        subtitle="Get a private link to pre-order Summer ’26 24 hours before public launch. Drop your email."
        cta="Send me the link"
      />

      {/* Drop-scoped FAQ */}
      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <p className="eyebrow text-center">Drop FAQ</p>
          <h2 className="mt-3 text-center text-3xl font-extrabold tracking-tightest md:text-5xl">
            Questions about Summer ’26.
          </h2>
          <div className="mt-12 divide-y divide-ink/10">
            {DROP_FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold md:text-lg">
                  <span>{f.q}</span>
                  <span className="ml-4 text-burgundy transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-base leading-7 opacity-80">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA + sticky mobile bar */}
      <Summer26StickyCta />
    </>
  );
}

const DROP_FAQ = [
  {
    q: "What does pre-order mean for Summer ’26?",
    a: "You reserve your size now and pay only when the courier delivers. The first batch ships the week of public launch. If you skip pre-order and want to buy after launch, the same pieces will be available — but the boxy-tee and linen-shorts colorways are first-batch-only.",
  },
  {
    q: "How is Summer ’26 different from a regular summer tee?",
    a: "Same posture, lighter hand. Tighter weave so the silhouette holds without weight. Lined linen shorts so they sit where they should. Same Alexandria workshop. Same QC.",
  },
  {
    q: "What sizes are available, and how do I pick mine?",
    a: "S–XL on every piece. The boxy tee runs one size larger by intention — go true-to-size for an oversized fit, size down for a sharp fit. Lightweight hoodie matches our 400 GSM Classic Hoodie sizing.",
  },
  {
    q: "Can I exchange or return a Summer ’26 piece?",
    a: "Yes. 14-day window from delivery. Try it on, decide. We collect, swap or refund. No restocking fees.",
  },
  {
    q: "When does the public launch open, and how will I know?",
    a: "Public launch opens at the date shown in the countdown above. Insider list members get the pre-order link 24 hours earlier. Drop your email to make the list.",
  },
];
