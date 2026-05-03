import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OrganizationSchema } from "@/components/organization-schema";
import { CartDrawer } from "@/components/cart-drawer";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const SITE_URL = "https://www.viddawear.store";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VIDDA WEAR — Heavyweight Streetwear from Alexandria",
    template: "%s · VIDDA WEAR",
  },
  description:
    "VIDDA WEAR — Egyptian heavyweight streetwear. 400 GSM hoodies, premium pants, Summer '26 pre-order. Try before you pay — every governorate.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "VIDDA WEAR",
    title: "VIDDA WEAR — Heavyweight Streetwear",
    description:
      "Egypt's heavyweight streetwear brand. Built in Alexandria. Try before you pay.",
    images: [{ url: "https://files.easy-orders.net/1770675406046305268.jpeg", width: 1200, height: 630, alt: "VIDDA WEAR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIDDA WEAR — Heavyweight Streetwear",
    description: "Egypt's heavyweight streetwear brand. Built in Alexandria.",
    images: ["https://files.easy-orders.net/1770675406046305268.jpeg"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased`}>
        <OrganizationSchema />
        <SiteHeader />
        <main className="min-h-[60vh]">{children}</main>
        <SiteFooter />
        <CartDrawer />
      </body>
    </html>
  );
}
