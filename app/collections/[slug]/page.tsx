import type { Metadata } from "next";
import { getProducts } from "@/lib/easyorders";
import { CollectionGrid } from "@/components/collection-grid";

interface Props { params: { slug: string } }

const COLLECTIONS: Record<string, { title: string; match: (slug: string) => boolean; description: string }> = {
  hoodies: {
    title: "Hoodies",
    match: (slug) => /hoodie/.test(slug),
    description: "VIDDA hoodies — 400 GSM heavyweight Egyptian cotton. Built for presence.",
  },
  pants: {
    title: "Pants",
    match: (slug) => /pant|trouser|sweat/.test(slug),
    description: "VIDDA pants — wide-leg sweatpants and structured trousers, made in Alexandria.",
  },
  "summer-26": {
    title: "Summer ’26",
    match: () => false, // populated when SKUs ship
    description: "Six pieces. One drop. Pre-order Summer ’26.",
  },
};

export async function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = COLLECTIONS[params.slug];
  if (!c) return { title: "Collection not found" };
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `/collections/${params.slug}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const collection = COLLECTIONS[params.slug];
  if (!collection) {
    return (
      <section className="mx-auto max-w-wrap px-5 py-24">
        <h1 className="text-3xl font-extrabold">Collection not found</h1>
      </section>
    );
  }
  const all = await getProducts();
  const products = all.filter((p) => collection.match(p.slug));

  return (
    <section className="bg-ivory">
      <div className="mx-auto max-w-wrap px-5 py-16">
        <p className="eyebrow">VIDDA · Collection</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tightest md:text-6xl">{collection.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 opacity-80">{collection.description}</p>

        {products.length === 0 ? (
          <p className="mt-12 opacity-70">More pieces coming soon.</p>
        ) : (
          <CollectionGrid products={products} />
        )}
      </div>
    </section>
  );
}
