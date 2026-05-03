import Link from "next/link";
import { CartButton } from "@/components/cart-button";

const NAV = [
  { href: "/collections/hoodies", label: "Hoodies" },
  { href: "/collections/pants", label: "Pants" },
  { href: "/pages/summer-26", label: "Summer ’26", accent: true },
  { href: "/pages/about-us", label: "About" },
  { href: "/pages/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ink text-white">
      <div className="mx-auto flex max-w-wrap items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tightest">
          VIDDA WEAR
        </Link>
        <nav className="hidden gap-7 text-sm font-semibold tracking-wide md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={n.accent ? "text-[#e6b8c2] hover:text-white" : "hover:text-[#e6b8c2]"}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
