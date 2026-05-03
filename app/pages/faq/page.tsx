import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Returns, Sizing, Try Before You Pay",
  description: "VIDDA WEAR FAQ — return window, sizing for heavyweight pieces, Try Before You Pay explained, contact methods.",
  alternates: { canonical: "/pages/faq" },
};

const FAQ = [
  {
    id: "returns",
    q: "How long do I have to return or exchange?",
    a: "14 days from delivery. Open the box, try the piece on, decide. If the size is off or anything's wrong, we collect it and either swap or refund. No restocking fees.",
  },
  {
    id: "sizing",
    q: "How does sizing work for heavyweight pieces?",
    a: "Our hoodies are 400 GSM — denser than standard streetwear. They drape with structure rather than clinging. If you're between sizes, size down for a sharp fit; size up for an oversized cut. The pants are wide-leg with a relaxed waist; pick your true waist.",
  },
  {
    id: "tbpy",
    q: "What does Try Before You Pay mean?",
    a: "Cash-on-delivery is available for every governorate. When the courier arrives you can open the package, try the piece on, and only pay if you keep it. No payment up front. No risk.",
  },
  {
    id: "contact",
    q: "How do I reach VIDDA WEAR?",
    a: "WhatsApp +20 105 002 7773 (replies under one hour during business hours), email viddawear@gmail.com, or DM @vidda.wear on Instagram and TikTok. Open Sat–Thu, 11am–9pm Cairo time.",
  },
];

export default function FaqPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="bg-ivory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mx-auto max-w-wrap px-5 py-24">
        <p className="eyebrow">Help</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tightest md:text-5xl">Frequently asked.</h1>

        <div className="mt-12 divide-y divide-ink/10">
          {FAQ.map((f) => (
            <details key={f.id} id={f.id} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-bold">
                <span>{f.q}</span>
                <span className="ml-4 text-burgundy transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-3xl text-base leading-7 opacity-80">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-16 rounded-sm border border-ink/10 bg-white p-8">
          <p className="eyebrow">Still need help?</p>
          <h2 className="mt-2 text-2xl font-extrabold">Talk to us directly.</h2>
          <p className="mt-3 leading-7">
            WhatsApp <a href="https://wa.me/201050027773" target="_blank" rel="noopener noreferrer" className="underline decoration-burgundy">+20 105 002 7773</a> · Email <a href="mailto:viddawear@gmail.com" className="underline decoration-burgundy">viddawear@gmail.com</a>
          </p>
          <p className="text-sm opacity-70">Sat–Thu, 11am–9pm Cairo time. Alexandria, Egypt.</p>
        </div>
      </div>
    </section>
  );
}
