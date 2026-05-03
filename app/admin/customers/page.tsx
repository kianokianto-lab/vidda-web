import { customers } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  const list = customers.list();
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Customers</h1>
      <p className="mt-2 text-sm opacity-70">Auto-derived from orders. {list.length} customer{list.length === 1 ? "" : "s"} so far.</p>
      <div className="mt-8 overflow-hidden rounded-sm border border-ink/10 bg-white">
        {list.length === 0 ? (
          <p className="p-6 text-sm opacity-60">No customers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-left text-xs uppercase tracking-eyebrow opacity-70">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone / Email</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">LTV</th><th className="px-4 py-3">Last seen</th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-bold">{c.name}</td>
                  <td className="px-4 py-3 text-xs opacity-70">{c.phone}<br />{c.email}</td>
                  <td className="px-4 py-3">{c.orders_count}</td>
                  <td className="px-4 py-3 font-bold text-burgundy">{c.lifetime_value} EGP</td>
                  <td className="px-4 py-3 text-xs opacity-60">{new Date(c.last_seen).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
