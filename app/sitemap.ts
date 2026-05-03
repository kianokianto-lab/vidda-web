import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/easyorders";

const SITE = "https://www.viddawear.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const now = new Date();

  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/pages/summer-26`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${SITE}/collections/hoodies`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/collections/pants`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/pages/about-us`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/pages/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...products.map((p) => ({
      url: `${SITE}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
