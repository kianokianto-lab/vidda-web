/**
 * Order persistence + webhook dispatch for VIDDA WEAR.
 *
 * Storage: append-only JSONL at /data/orders.jsonl (M4).
 * In M5 the file-store is swapped for SQLite (the Order interface stays stable).
 *
 * Webhook: if EO_WEBHOOK_URL is set in env, every accepted order is POSTed
 * to that URL. Failures are logged but don't fail the order (write-then-fan-out).
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { orders as ordersRepo } from "./repos";

export interface OrderLineInput {
  productSlug: string;
  title: string;
  qty: number;
  price: number;
  variantLabel?: string;
  options?: Record<string, string>;
}

export interface OrderCustomerInput {
  name: string;
  phone: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    governorate: string;
    country: string; // ISO-3166 (defaults "EG")
  };
  notes?: string;
}

export interface OrderInput {
  customer: OrderCustomerInput;
  lines: OrderLineInput[];
  paymentMethod: "cod" | "stripe" | "easyorders";
  source?: string; // e.g. "summer-26-lp", "cart-drawer"
  locale?: string;
}

export interface Order extends OrderInput {
  id: string;
  total: number;
  currency: "EGP";
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

const DATA_DIR = process.env.VIDDA_DATA_DIR ?? path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.jsonl");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function newOrderId(): string {
  // Time-sortable id with random suffix: VW-26ABCDEF-XYZ123
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `VW-${ts}-${rand}`;
}

export function computeTotal(lines: OrderLineInput[]): number {
  return lines.reduce((acc, l) => acc + l.qty * l.price, 0);
}

export function validateOrder(input: unknown): { ok: true; value: OrderInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Body required" };
  const r = input as Record<string, unknown>;

  const customer = r.customer as OrderCustomerInput | undefined;
  if (!customer || typeof customer !== "object") return { ok: false, error: "customer required" };
  if (!customer.name || typeof customer.name !== "string") return { ok: false, error: "customer.name required" };
  if (!customer.phone || typeof customer.phone !== "string") return { ok: false, error: "customer.phone required" };
  if (!customer.address || typeof customer.address !== "object") return { ok: false, error: "customer.address required" };
  const a = customer.address;
  if (!a.line1 || !a.city || !a.governorate) return { ok: false, error: "customer.address.{line1,city,governorate} required" };

  const lines = r.lines as OrderLineInput[] | undefined;
  if (!Array.isArray(lines) || lines.length === 0) return { ok: false, error: "lines must be a non-empty array" };
  for (const l of lines) {
    if (!l.productSlug || !l.title) return { ok: false, error: "line.productSlug and line.title required" };
    if (typeof l.qty !== "number" || l.qty < 1) return { ok: false, error: "line.qty must be >= 1" };
    if (typeof l.price !== "number" || l.price < 0) return { ok: false, error: "line.price must be >= 0" };
  }

  const paymentMethod = r.paymentMethod;
  if (paymentMethod !== "cod" && paymentMethod !== "stripe" && paymentMethod !== "easyorders") {
    return { ok: false, error: "paymentMethod must be cod | stripe | easyorders" };
  }

  return {
    ok: true,
    value: {
      customer: {
        ...customer,
        address: { ...customer.address, country: customer.address.country || "EG" },
      },
      lines,
      paymentMethod,
      source: typeof r.source === "string" ? r.source : undefined,
      locale: typeof r.locale === "string" ? r.locale : undefined,
    },
  };
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const order: Order = {
    ...input,
    id: newOrderId(),
    total: computeTotal(input.lines),
    currency: "EGP",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  // Primary persistence: SQLite via repos (M5+).
  // Best-effort JSONL mirror retained for greppable backup + bridge from M4.
  ordersRepo.create({
    id: order.id,
    customer: order.customer,
    lines: order.lines,
    paymentMethod: order.paymentMethod,
    total: order.total,
    currency: order.currency,
    status: order.status,
    source: order.source ?? null,
    locale: order.locale ?? null,
  });
  try {
    await ensureDataDir();
    await fs.appendFile(ORDERS_FILE, JSON.stringify(order) + "\n", "utf-8");
  } catch (e) {
    // JSONL mirror is non-critical when SQLite is the source of truth.
    console.warn(`[orders] jsonl mirror failed for ${order.id}:`, e);
  }

  // Fan out to EasyOrders webhook (best effort).
  await dispatchWebhook(order).catch((e) => {
    console.error(`[orders] webhook dispatch failed for ${order.id}:`, e);
  });

  return order;
}

export async function listOrders(): Promise<Order[]> {
  await ensureDataDir();
  try {
    const buf = await fs.readFile(ORDERS_FILE, "utf-8");
    return buf
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l) as Order);
  } catch {
    return [];
  }
}

export async function getOrder(id: string): Promise<Order | null> {
  const all = await listOrders();
  return all.find((o) => o.id === id) ?? null;
}

/* ---------- webhook dispatch ---------- */

async function dispatchWebhook(order: Order): Promise<void> {
  const url = process.env.EO_WEBHOOK_URL;
  if (!url) return;
  const secret = process.env.EO_WEBHOOK_SECRET ?? "";
  const body = JSON.stringify({ event: "order.created", data: order });
  const signature = secret ? crypto.createHmac("sha256", secret).update(body).digest("hex") : "";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Vidda-Signature": signature,
      "X-Vidda-Event": "order.created",
    },
    body,
  });
  if (!res.ok) throw new Error(`Webhook ${url} responded ${res.status}: ${await res.text().catch(() => "?")}`);
}

/* ---------- WhatsApp message builder (final version) ---------- */

export function buildWhatsappOrderMessage(order: OrderInput | Order): string {
  const total = "id" in order ? order.total : computeTotal(order.lines);
  const lines = order.lines
    .map((l, i) => {
      const variant = l.variantLabel ? ` (${l.variantLabel})` : "";
      return `${i + 1}. ${l.title}${variant} — ×${l.qty} — ${l.qty * l.price} EGP`;
    })
    .join("\n");
  const addr = order.customer.address;
  const addrBlock = addr.line1
    ? `\n📍 ${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.governorate}, ${addr.country}`
    : "";
  const idBlock = "id" in order ? `\nOrder ID: ${order.id}` : "";

  return [
    `Hello VIDDA — I'd like to place an order:`,
    ``,
    lines,
    ``,
    `Total: ${total} EGP`,
    `Pay on delivery (Try Before You Pay)`,
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    addrBlock.trim() ? addrBlock : "",
    order.customer.notes ? `Notes: ${order.customer.notes}` : "",
    idBlock.trim() ? idBlock : "",
  ]
    .filter((p) => p !== "")
    .join("\n");
}
