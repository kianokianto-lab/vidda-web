import Link from "next/link";
import { products } from "@/lib/repos";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const list = products.list();
  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tightest md:text-4xl">Products</h1>
          <p className="mt-2 text-sm opacity-70">{list.length} item{list.length === 1 ? "" : "s"} in the database.</p>
        </div>
        <Link href="/admin/products/new" className="btn-pill btn-pill-primary">+ New product</Link>
      </header>

      <div className="mt-8 overflow-hidden rounded-sm border border-ink/10 bg-white">
        {list.length === 0 ? (
          <p className="p-6 text-sm opacity-60">
            No products yet. The static catalog (Classic Hoodie, Street Pants) is rendered from <code>lib/easyorders.ts</code>.
            Create entries here once you&rsquo;re ready to migrate to the DB-backed catalog.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 bg-ink/5 text-left text-xs uppercase tracking-eyebrow opacity-70">
              <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-ink/5">
                  <td className="px-4 py-3 font-bold">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-xs opacity-70">{p.slug}</td>
                  <td className="px-4 py-3">{p.price} EGP</td>
                  <td className="px-4 py-3">{p.in_stock ? "In stock" : <span className="text-burgundy">Out</span>}</td>
                  <td className="px-4 py-3 text-right"><Link href={`/admin/products/${p.id}`} className="text-xs underline">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
