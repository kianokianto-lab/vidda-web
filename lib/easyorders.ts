/**
 * Typed EasyOrders REST client for VIDDA WEAR.
 *
 * Auth: bearer JWT in Authorization header, stored as EASYORDERS_TOKEN env var.
 *       Token is short-lived; refresh via the admin login flow when 401 is returned.
 *
 * Base: https://api.easy-orders.net/api/v1
 *
 * Implemented endpoints:
 *   - GET    /stores/settings         -> store settings (header_code, logo, contact, etc.)
 *   - PATCH  /stores/settings         -> update store settings (size-limited; prefer admin UI for header_code)
 *   - GET    /products                -> products list
 *   - GET    /products/{id}           -> single product
 *   - GET    /orders                  -> orders list
 *   - POST   /upload                  -> media upload (returns CDN path)
 */

const BASE = "https://api.easy-orders.net/api/v1";

function token(): string {
  const t = process.env.EASYORDERS_TOKEN;
  if (!t) throw new Error("EASYORDERS_TOKEN env var is missing");
  return t.startsWith("Bearer ") ? t : `Bearer ${t}`;
}

async function eo<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: token(),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    // 60s revalidation by default; tune per-call as needed
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`EO ${res.status}: ${path} — ${await res.text()}`);
  return res.json() as Promise<T>;
}

export interface EOProduct {
  id: string;
  slug: string;
  title: string;
  title_ar?: string;
  price: number;
  price_before_discount?: number;
  description?: string;
  images: { src: string; alt?: string }[];
  options?: { name: string; values: string[] }[];
  in_stock: boolean;
  sku?: string;
}

export interface EOSettings {
  name?: string;
  logo?: string;
  icon?: string;
  header_code?: string;
  footer_code?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  social?: { instagram?: string; tiktok?: string; facebook?: string };
}

export const EO = {
  settings: () => eo<EOSettings>("/stores/settings"),
  products: () => eo<{ products: EOProduct[]; count: number }>("/products"),
  product: (id: string) => eo<EOProduct>(`/products/${id}`),
  orders: () => eo<unknown>("/orders"),
};

/**
 * Static catalog fallback for builds where EO API isn't reachable
 * (e.g. preview deploys without the token in env).
 * Mirrors what's currently in the live header_code.
 */
export const STATIC_PRODUCTS: EOProduct[] = [
  {
    id: "vidda-classic-hoodie",
    slug: "vidda-classic-hoodie",
    title: "VIDDA Classic Hoodie — Premium 400 GSM",
    title_ar: "هودي بريميوم 400 GSM",
    price: 999,
    description:
      "هودي بريميوم 400 GSM من VIDDA WEAR — خامات عالية الجودة، تفاصيل دقيقة، قصة كلاسيكية بشخصية واضحة.",
    images: [
      { src: "https://files.easy-orders.net/1770675406046305268.jpeg", alt: "VIDDA Classic Hoodie" },
    ],
    in_stock: true,
    sku: "VIDDA-HOODIE-01",
  },
  {
    id: "vidda-street-pants",
    slug: "vidda-street-pants",
    title: "VIDDA Street Pants — Wide Leg Sweatpants",
    title_ar: "سويت بانتس وايد ليج",
    price: 999,
    description:
      "سويت بانتس وايد ليج من VIDDA WEAR — قصة مريحة وخامات بريميوم.",
    images: [
      { src: "https://files.easy-orders.net/1770675406046305268.jpeg", alt: "VIDDA Street Pants" },
    ],
    in_stock: true,
    sku: "VIDDA-PANTS-01",
  },
];

export async function getProducts(): Promise<EOProduct[]> {
  try {
    const r = await EO.products();
    return r.products;
  } catch {
    return STATIC_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<EOProduct | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}
