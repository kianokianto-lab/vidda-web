import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/links", "/api/"] },
    ],
    sitemap: "https://www.viddawear.store/sitemap.xml",
  };
}
