/**
 * JSON-LD Organization schema injected once per page.
 * Mirrors the schema currently shipped via header_code on the EasyOrders storefront,
 * so the migration to Next.js doesn't lose SEO trust signals.
 */
export function OrganizationSchema() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: "VIDDA WEAR",
    url: "https://www.viddawear.store",
    logo: "https://files.easy-orders.net/1770675406046305268.jpeg",
    description:
      "Egyptian heavyweight streetwear brand. 400 GSM hoodies, premium pants, Summer '26 pre-order. Try before you pay — every governorate.",
    sameAs: [
      "https://www.instagram.com/vidda.wear",
      "https://www.facebook.com/share/1DRa2mKRNo",
      "https://www.tiktok.com/@vidda.wear",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+201050027773",
      email: "viddawear@gmail.com",
      contactType: "customer service",
      areaServed: "EG",
      availableLanguage: ["Arabic", "English"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Alexandria",
      addressCountry: "EG",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}
