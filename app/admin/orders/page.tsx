import Link from "next/link";
import { orders } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const list = orders.list();
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Orders</h1>
      <p className="mt-2 text-sm opacity-70">{list.length} order{list.length === 1 ? "" : "s"} in the database.</p>
      <div className="mt-8 overflow-hidden rounded-sm border border-ink/10 bg-white">
        {list.length === 0 ? (
          <p className="p-6 text-sm opacity-60">No orders yet. Place a test order at /checkout to populate this list.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-left text-xs uppercase tracking-eyebrow opacity-70">
              <tr>
                <th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Method</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-b border-ink/5 hover:bg-ink/[0.02]">
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-bold underline">{o.id}</Link><p className="text-xs opacity-60">{new Date(o.created_at).toLocaleString()}</p></td>
                  <td className="px-4 py-3">{o.customer.name}<br /><span className="text-xs opacity-60">{o.customer.phone}</span></td>
                  <td className="px-4 py-3">{o.lines.length} item{o.lines.length === 1 ? "" : "s"}</td>
                  <td className="px-4 py-3 font-bold">{o.total} EGP</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-eyebrow font-bold">{o.status}</td>
                  <td className="px-4 py-3 text-xs opacity-70">{o.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
