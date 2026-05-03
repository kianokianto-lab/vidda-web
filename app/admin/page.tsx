import Link from "next/link";
import { adminStats, orders } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default function AdminHome() {
  const stats = adminStats();
  const recent = orders.list().slice(0, 8);

  const cards = [
    { label: "Products", v: stats.productCount, href: "/admin/products" },
    { label: "Collections", v: stats.collectionCount, href: "/admin/collections" },
    { label: "Orders", v: stats.orderCount, href: "/admin/orders" },
    { label: "Pending orders", v: stats.pendingOrders, href: "/admin/orders" },
    { label: "Customers", v: stats.customerCount, href: "/admin/customers" },
    { label: "Revenue (30d)", v: `${stats.revenue30d} EGP`, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Overview</h1>
      <p className="mt-2 text-sm opacity-70">Snapshot of your store. Click any card to drill in.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-sm border border-ink/10 bg-white p-5 hover:border-ink/30">
            <p className="text-xs uppercase tracking-eyebrow opacity-60">{c.label}</p>
            <p className="mt-2 text-3xl font-extrabold">{c.v}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-extrabold">Recent orders</h2>
      <div className="mt-4 overflow-hidden rounded-sm border border-ink/10 bg-white">
        {recent.length === 0 ? (
          <p className="p-5 text-sm opacity-60">No orders yet. Place a test order from /checkout to populate this list.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-left text-xs uppercase tracking-eyebrow opacity-70">
              <tr>
                <th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/admin/orders/${o.id}`} className="font-bold underline">{o.id}</Link>
                    <p className="opacity-60">{new Date(o.created_at).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">{o.customer.name}<br /><span className="text-xs opacity-60">{o.customer.phone}</span></td>
                  <td className="px-4 py-3 font-bold">{o.total} EGP</td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const color = {
    pending: "bg-burgundy/10 text-burgundy",
    confirmed: "bg-blue-500/10 text-blue-700",
    shipped: "bg-amber-500/10 text-amber-700",
    delivered: "bg-emerald-500/10 text-emerald-700",
    cancelled: "bg-ink/10 text-ink/60",
  }[status] ?? "bg-ink/10 text-ink";
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-eyebrow ${color}`}>{status}</span>;
}
