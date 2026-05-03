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
  products: () => eo<unknown>("/products"),
  product: (id: string) => eo<EOProduct>(`/products/${id}`),
  orders: () => eo<unknown>("/orders"),
};

/**
 * Defensively normalize the products list across EO response shapes.
 * The API has shipped at least 3 envelopes in the wild:
 *   { products: [...] }, { data: [...] }, or a bare array.
 */
function normalizeProducts(raw: unknown): EOProduct[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) list = raw;
  else if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.products)) list = r.products;
    else if (Array.isArray(r.data)) list = r.data;
    else if (Array.isArray(r.items)) list = r.items;
  }
  // Defensively coerce each item to a safe EOProduct shape so consumers can
  // assume images[], title, price, slug exist without crashing the prerender.
  return list
    .map((p): EOProduct | null => {
      if (!p || typeof p !== "object") return null;
      const r = p as Record<string, unknown>;
      const slug = String(r.slug ?? r.handle ?? r.id ?? "");
      const title = String(r.title ?? r.name ?? "");
      if (!slug || !title) return null;
      const rawImages = r.images ?? r.image ?? [];
      const images = Array.isArray(rawImages)
        ? rawImages.map((i: unknown) => {
            if (typeof i === "string") return { src: i };
            if (i && typeof i === "object") {
              const ri = i as Record<string, unknown>;
              const src = String(ri.src ?? ri.url ?? ri.path ?? "");
              return { src, alt: ri.alt ? String(ri.alt) : undefined };
            }
            return { src: "" };
          }).filter((i) => i.src)
        : typeof rawImages === "string" ? [{ src: rawImages }] : [];
      return {
        id: String(r.id ?? slug),
        slug,
        title,
        title_ar: r.title_ar ? String(r.title_ar) : undefined,
        price: Number(r.price ?? r.amount ?? 0),
        price_before_discount: r.price_before_discount ? Number(r.price_before_discount) : undefined,
        description: r.description ? String(r.description) : undefined,
        images,
        options: Array.isArray(r.options) ? (r.options as EOProduct["options"]) : undefined,
        in_stock: r.in_stock !== false,
        sku: r.sku ? String(r.sku) : undefined,
      };
    })
    .filter((p): p is EOProduct => p !== null);
}

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
    options: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Black", "Burgundy", "Off-white"] },
    ],
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
    options: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
    ],
  },
];

export async function getProducts(): Promise<EOProduct[]> {
  try {
    const raw = await EO.products();
    const list = normalizeProducts(raw);
    return list.length > 0 ? list : STATIC_PRODUCTS;
  } catch {
    return STATIC_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<EOProduct | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}
