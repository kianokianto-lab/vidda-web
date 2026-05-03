import { notFound } from "next/navigation";
import { orders } from "@/lib/repos";
import { OrderStatusActions } from "@/components/admin/order-status-actions";

export const dynamic = "force-dynamic";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const o = orders.get(params.id);
  if (!o) notFound();
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Order {o.id}</h1>
      <p className="mt-2 text-sm opacity-70">Placed {new Date(o.created_at).toLocaleString()}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr,300px]">
        <div className="space-y-6">
          <section className="rounded-sm border border-ink/10 bg-white p-6">
            <h2 className="text-lg font-extrabold">Items</h2>
            <ul className="mt-4 divide-y divide-ink/10">
              {o.lines.map((l, i) => (
                <li key={i} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-bold">{l.title}</p>
                    {l.variantLabel && <p className="text-xs opacity-60">{l.variantLabel}</p>}
                    <p className="text-xs opacity-60 font-mono">{l.productSlug}</p>
                  </div>
                  <div className="text-right">
                    <p>×{l.qty}</p>
                    <p className="font-bold text-burgundy">{l.qty * l.price} EGP</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-ink/10 pt-4 text-right">
              <p className="text-xs opacity-60 uppercase tracking-eyebrow">Total</p>
              <p className="text-2xl font-extrabold">{o.total} EGP</p>
            </div>
          </section>

          <section className="rounded-sm border border-ink/10 bg-white p-6">
            <h2 className="text-lg font-extrabold">Customer</h2>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Row k="Name" v={o.customer.name} />
              <Row k="Phone" v={o.customer.phone} />
              {o.customer.email && <Row k="Email" v={o.customer.email} />}
              <Row k="Address" v={`${o.customer.address.line1}${o.customer.address.line2 ? ", " + o.customer.address.line2 : ""}`} />
              <Row k="City" v={o.customer.address.city} />
              <Row k="Governorate" v={o.customer.address.governorate} />
              {o.customer.notes && <Row k="Notes" v={o.customer.notes} wide />}
            </dl>
          </section>
        </div>

        <aside className="space-y-4 md:sticky md:top-8 md:self-start">
          <section className="rounded-sm border border-ink/10 bg-white p-6">
            <h2 className="text-lg font-extrabold">Status</h2>
            <p className="mt-2 text-2xl font-extrabold uppercase tracking-eyebrow text-burgundy">{o.status}</p>
            <OrderStatusActions orderId={o.id} status={o.status} />
          </section>
          <section className="rounded-sm border border-ink/10 bg-white p-6 text-sm">
            <h2 className="text-lg font-extrabold">Payment</h2>
            <p className="mt-2">{o.paymentMethod}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : ""}>
      <dt className="text-xs uppercase tracking-eyebrow opacity-60">{k}</dt>
      <dd className="mt-1">{v}</dd>
    </div>
  );
}
