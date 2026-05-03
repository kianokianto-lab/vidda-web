/**
 * Repository layer for VIDDA WEAR admin.
 * Thin SQL wrappers. All write paths return the just-written row.
 */

import { db } from "./db";
import crypto from "crypto";

const id = () => crypto.randomBytes(8).toString("hex");

/* ---------- Products ---------- */

export interface DbProduct {
  id: string;
  slug: string;
  title: string;
  title_ar: string | null;
  price: number;
  price_before: number | null;
  description: string | null;
  images: { src: string; alt?: string }[];
  options: { name: string; values: string[] }[];
  in_stock: boolean;
  sku: string | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductRow {
  id: string;
  slug: string;
  title: string;
  title_ar: string | null;
  price: number;
  price_before: number | null;
  description: string | null;
  images_json: string;
  options_json: string;
  in_stock: number;
  sku: string | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToProduct(r: ProductRow): DbProduct {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    title_ar: r.title_ar,
    price: r.price,
    price_before: r.price_before,
    description: r.description,
    images: JSON.parse(r.images_json),
    options: JSON.parse(r.options_json),
    in_stock: r.in_stock !== 0,
    sku: r.sku,
    collection_id: r.collection_id,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export const products = {
  list(): DbProduct[] {
    const rows = db().prepare("SELECT * FROM products ORDER BY created_at DESC").all() as ProductRow[];
    return rows.map(rowToProduct);
  },
  get(idOrSlug: string): DbProduct | null {
    const r = db().prepare("SELECT * FROM products WHERE id = ? OR slug = ?").get(idOrSlug, idOrSlug) as ProductRow | undefined;
    return r ? rowToProduct(r) : null;
  },
  create(p: Omit<DbProduct, "id" | "created_at" | "updated_at">): DbProduct {
    const newId = id();
    db().prepare(
      `INSERT INTO products (id, slug, title, title_ar, price, price_before, description,
        images_json, options_json, in_stock, sku, collection_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      newId, p.slug, p.title, p.title_ar, p.price, p.price_before, p.description,
      JSON.stringify(p.images), JSON.stringify(p.options),
      p.in_stock ? 1 : 0, p.sku, p.collection_id
    );
    return products.get(newId)!;
  },
  update(idVal: string, patch: Partial<Omit<DbProduct, "id" | "created_at" | "updated_at">>): DbProduct | null {
    const existing = products.get(idVal);
    if (!existing) return null;
    const merged = { ...existing, ...patch };
    db().prepare(
      `UPDATE products SET slug=?, title=?, title_ar=?, price=?, price_before=?, description=?,
       images_json=?, options_json=?, in_stock=?, sku=?, collection_id=?, updated_at=datetime('now') WHERE id=?`
    ).run(
      merged.slug, merged.title, merged.title_ar, merged.price, merged.price_before, merged.description,
      JSON.stringify(merged.images), JSON.stringify(merged.options),
      merged.in_stock ? 1 : 0, merged.sku, merged.collection_id, idVal
    );
    return products.get(idVal);
  },
  remove(idVal: string): boolean {
    return db().prepare("DELETE FROM products WHERE id = ?").run(idVal).changes > 0;
  },
};

/* ---------- Collections ---------- */

export interface DbCollection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  hero_image: string | null;
  sort: number;
  created_at: string;
  updated_at: string;
}

export const collections = {
  list(): DbCollection[] {
    return db().prepare("SELECT * FROM collections ORDER BY sort ASC, created_at DESC").all() as DbCollection[];
  },
  get(idOrSlug: string): DbCollection | null {
    return (db().prepare("SELECT * FROM collections WHERE id=? OR slug=?").get(idOrSlug, idOrSlug) as DbCollection | undefined) ?? null;
  },
  create(c: Omit<DbCollection, "id" | "created_at" | "updated_at">): DbCollection {
    const newId = id();
    db().prepare(
      `INSERT INTO collections (id, slug, title, description, hero_image, sort) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(newId, c.slug, c.title, c.description, c.hero_image, c.sort);
    return collections.get(newId)!;
  },
  update(idVal: string, patch: Partial<DbCollection>): DbCollection | null {
    const existing = collections.get(idVal);
    if (!existing) return null;
    const merged = { ...existing, ...patch };
    db().prepare(
      `UPDATE collections SET slug=?, title=?, description=?, hero_image=?, sort=?, updated_at=datetime('now') WHERE id=?`
    ).run(merged.slug, merged.title, merged.description, merged.hero_image, merged.sort, idVal);
    return collections.get(idVal);
  },
  remove(idVal: string): boolean {
    return db().prepare("DELETE FROM collections WHERE id=?").run(idVal).changes > 0;
  },
};

/* ---------- Orders (M5 SQLite-backed; supersedes M4 jsonl) ---------- */

export interface DbOrder {
  id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: { line1: string; line2?: string; city: string; governorate: string; country: string };
    notes?: string;
  };
  lines: { productSlug: string; title: string; qty: number; price: number; variantLabel?: string; options?: Record<string, string> }[];
  paymentMethod: "cod" | "stripe" | "easyorders";
  total: number;
  currency: "EGP";
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  source: string | null;
  locale: string | null;
  created_at: string;
}

interface OrderRow {
  id: string;
  customer_json: string;
  lines_json: string;
  payment_method: string;
  total: number;
  currency: string;
  status: string;
  source: string | null;
  locale: string | null;
  created_at: string;
}

function rowToOrder(r: OrderRow): DbOrder {
  return {
    id: r.id,
    customer: JSON.parse(r.customer_json),
    lines: JSON.parse(r.lines_json),
    paymentMethod: r.payment_method as DbOrder["paymentMethod"],
    total: r.total,
    currency: r.currency as "EGP",
    status: r.status as DbOrder["status"],
    source: r.source,
    locale: r.locale,
    created_at: r.created_at,
  };
}

export const orders = {
  list(): DbOrder[] {
    return (db().prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as OrderRow[]).map(rowToOrder);
  },
  get(idVal: string): DbOrder | null {
    const r = db().prepare("SELECT * FROM orders WHERE id=?").get(idVal) as OrderRow | undefined;
    return r ? rowToOrder(r) : null;
  },
  create(o: Omit<DbOrder, "created_at">): DbOrder {
    db().prepare(
      `INSERT INTO orders (id, customer_json, lines_json, payment_method, total, currency, status, source, locale)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(o.id, JSON.stringify(o.customer), JSON.stringify(o.lines), o.paymentMethod, o.total, o.currency, o.status, o.source, o.locale);
    customers.upsertFromOrder(o);
    return orders.get(o.id)!;
  },
  setStatus(idVal: string, status: DbOrder["status"]): DbOrder | null {
    db().prepare("UPDATE orders SET status=? WHERE id=?").run(status, idVal);
    return orders.get(idVal);
  },
};

/* ---------- Customers (derived from orders) ---------- */

export interface DbCustomer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  first_seen: string;
  last_seen: string;
  orders_count: number;
  lifetime_value: number;
}

export const customers = {
  list(): DbCustomer[] {
    return db().prepare("SELECT * FROM customers ORDER BY last_seen DESC").all() as DbCustomer[];
  },
  upsertFromOrder(o: Pick<DbOrder, "customer" | "total">): void {
    const phone = o.customer.phone || null;
    const email = o.customer.email || null;
    const existing = phone
      ? (db().prepare("SELECT * FROM customers WHERE phone=?").get(phone) as DbCustomer | undefined)
      : email
        ? (db().prepare("SELECT * FROM customers WHERE email=?").get(email) as DbCustomer | undefined)
        : undefined;
    if (existing) {
      db().prepare(
        `UPDATE customers SET name=?, email=COALESCE(?, email), last_seen=datetime('now'),
         orders_count=orders_count+1, lifetime_value=lifetime_value+? WHERE id=?`
      ).run(o.customer.name, email, o.total, existing.id);
    } else {
      db().prepare(
        `INSERT INTO customers (id, name, phone, email, orders_count, lifetime_value)
         VALUES (?, ?, ?, ?, 1, ?)`
      ).run(id(), o.customer.name, phone, email, o.total);
    }
  },
};

/* ---------- Homepage sections ---------- */

export interface DbHomepageSection {
  id: string;
  kind: "hero" | "band" | "feature" | "promo";
  title: string | null;
  body: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image: string | null;
  sort: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface SectionRow {
  id: string;
  kind: string;
  title: string | null;
  body: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image: string | null;
  sort: number;
  enabled: number;
  created_at: string;
  updated_at: string;
}

function rowToSection(r: SectionRow): DbHomepageSection {
  return {
    id: r.id,
    kind: r.kind as DbHomepageSection["kind"],
    title: r.title,
    body: r.body,
    cta_label: r.cta_label,
    cta_href: r.cta_href,
    image: r.image,
    sort: r.sort,
    enabled: r.enabled !== 0,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export const sections = {
  list(): DbHomepageSection[] {
    return (db().prepare("SELECT * FROM homepage_sections ORDER BY sort ASC, created_at ASC").all() as SectionRow[]).map(rowToSection);
  },
  get(idVal: string): DbHomepageSection | null {
    const r = db().prepare("SELECT * FROM homepage_sections WHERE id=?").get(idVal) as SectionRow | undefined;
    return r ? rowToSection(r) : null;
  },
  create(s: Omit<DbHomepageSection, "id" | "created_at" | "updated_at">): DbHomepageSection {
    const newId = id();
    db().prepare(
      `INSERT INTO homepage_sections (id, kind, title, body, cta_label, cta_href, image, sort, enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(newId, s.kind, s.title, s.body, s.cta_label, s.cta_href, s.image, s.sort, s.enabled ? 1 : 0);
    return sections.get(newId)!;
  },
  update(idVal: string, patch: Partial<DbHomepageSection>): DbHomepageSection | null {
    const existing = sections.get(idVal);
    if (!existing) return null;
    const merged = { ...existing, ...patch };
    db().prepare(
      `UPDATE homepage_sections SET kind=?, title=?, body=?, cta_label=?, cta_href=?,
       image=?, sort=?, enabled=?, updated_at=datetime('now') WHERE id=?`
    ).run(merged.kind, merged.title, merged.body, merged.cta_label, merged.cta_href, merged.image, merged.sort, merged.enabled ? 1 : 0, idVal);
    return sections.get(idVal);
  },
  remove(idVal: string): boolean {
    return db().prepare("DELETE FROM homepage_sections WHERE id=?").run(idVal).changes > 0;
  },
};

/* ---------- Images ---------- */

export interface DbImage {
  id: string;
  path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  created_at: string;
}

export const images = {
  list(): DbImage[] {
    return db().prepare("SELECT * FROM images ORDER BY created_at DESC").all() as DbImage[];
  },
  create(img: Omit<DbImage, "id" | "created_at">): DbImage {
    const newId = id();
    db().prepare(
      `INSERT INTO images (id, path, alt, width, height, bytes) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(newId, img.path, img.alt, img.width, img.height, img.bytes);
    return db().prepare("SELECT * FROM images WHERE id=?").get(newId) as DbImage;
  },
  remove(idVal: string): boolean {
    return db().prepare("DELETE FROM images WHERE id=?").run(idVal).changes > 0;
  },
};

/* ---------- Stats (admin home) ---------- */

export interface AdminStats {
  productCount: number;
  collectionCount: number;
  orderCount: number;
  pendingOrders: number;
  customerCount: number;
  revenue30d: number;
}

export function adminStats(): AdminStats {
  const productCount = (db().prepare("SELECT COUNT(*) as c FROM products").get() as { c: number }).c;
  const collectionCount = (db().prepare("SELECT COUNT(*) as c FROM collections").get() as { c: number }).c;
  const orderCount = (db().prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }).c;
  const pendingOrders = (db().prepare("SELECT COUNT(*) as c FROM orders WHERE status='pending'").get() as { c: number }).c;
  const customerCount = (db().prepare("SELECT COUNT(*) as c FROM customers").get() as { c: number }).c;
  const revenue30d = (db().prepare(
    "SELECT COALESCE(SUM(total),0) as t FROM orders WHERE created_at >= datetime('now','-30 days')"
  ).get() as { t: number }).t;
  return { productCount, collectionCount, orderCount, pendingOrders, customerCount, revenue30d };
}
