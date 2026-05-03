import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/easyorders";
import { ProductBuyBox } from "@/components/product-buy-box";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description?.slice(0, 160) || `${product.title} from VIDDA WEAR.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      images: product.images.map((i) => ({ url: i.src, alt: i.alt || product.title })),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) return notFound();

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images.map((i) => i.src),
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: "VIDDA WEAR" },
    offers: {
      "@type": "Offer",
      url: `https://www.viddawear.store/products/${product.slug}`,
      priceCurrency: "EGP",
      price: product.price,
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.viddawear.store/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://www.viddawear.store/collections/hoodies" },
      { "@type": "ListItem", position: 3, name: product.title, item: `https://www.viddawear.store/products/${product.slug}` },
    ],
  };

  return (
    <section className="bg-ivory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto grid max-w-wrap gap-10 px-5 py-16 md:grid-cols-2">
        <div className="grid gap-3">
          {product.images.map((img, i) => (
            <div
              key={i}
              className="aspect-[4/5] w-full bg-ink bg-cover bg-center"
              style={{ backgroundImage: `url(${img.src})` }}
              aria-label={img.alt || `${product.title} — image ${i + 1}`}
            />
          ))}
        </div>
        <div>
          <p className="eyebrow">VIDDA WEAR</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tightest md:text-5xl">{product.title}</h1>
          <p className="mt-4 text-2xl font-bold text-burgundy">{product.price} EGP</p>
          <p className="mt-6 leading-7 opacity-80">{product.description}</p>
          <ProductBuyBox product={product} />
        </div>
      </div>
    </section>
  );
}
