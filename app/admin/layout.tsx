import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VIDDA Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/sections", label: "Homepage" },
  { href: "/admin/images", label: "Images" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-ink/10 bg-white px-5 py-8 md:block">
        <Link href="/admin" className="block text-lg font-extrabold tracking-tightest">VIDDA · Admin</Link>
        <nav className="mt-10 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-sm px-3 py-2 text-sm font-semibold hover:bg-ink/5">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-12 space-y-1 text-xs">
          <Link href="/" className="block rounded-sm px-3 py-2 opacity-60 hover:bg-ink/5">← Back to site</Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="block w-full rounded-sm px-3 py-2 text-left opacity-60 hover:bg-ink/5">Sign out</button>
          </form>
        </div>
      </aside>

      {/* Mobile top nav */}
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-white px-5 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="text-base font-extrabold tracking-tightest">VIDDA · Admin</Link>
          <form action="/api/admin/logout" method="POST"><button className="text-xs underline opacity-60">Sign out</button></form>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto text-xs">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-full bg-ink/5 px-3 py-1 font-semibold">{n.label}</Link>
          ))}
        </nav>
      </header>

      <main className="px-5 py-8 md:ml-56 md:px-10 md:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
