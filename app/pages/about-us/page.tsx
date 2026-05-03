import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — VIDDA WEAR",
  description: "VIDDA WEAR is an Egyptian heavyweight streetwear brand built in Alexandria. We don't trade presence for price.",
  alternates: { canonical: "/pages/about-us" },
};

export default function AboutPage() {
  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-3xl px-5 py-24">
        <p className="eyebrow">About</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tightest md:text-6xl">Built in Alexandria. Built to last.</h1>
        <div className="mt-10 space-y-6 text-lg leading-8">
          <p>VIDDA WEAR is an Egyptian heavyweight streetwear brand. We make clothes you feel before you see — 400 GSM hoodies, structured pants, fabric that doesn&rsquo;t apologize for itself.</p>
          <p>We started in Alexandria because Alexandria is where the Mediterranean meets the desert — where weight makes sense. We pattern, sample, and inspect every piece in the city. Nothing leaves until it earns the mark.</p>
          <p>We sell direct, online, with try-before-you-pay across every governorate. No middlemen. No discount theatre. Just heavyweight pieces priced at what they&rsquo;re worth.</p>
          <p className="text-burgundy font-bold">Weight you choose to carry.</p>
        </div>
      </div>
    </section>
  );
}
