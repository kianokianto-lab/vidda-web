import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ivory">
      <div className="mx-auto grid max-w-wrap gap-10 px-5 py-14 md:grid-cols-4">
        <div>
          <p className="text-xl font-extrabold tracking-tightest">VIDDA WEAR</p>
          <p className="mt-3 text-sm leading-6 opacity-80">
            Egyptian heavyweight streetwear, built in Alexandria.
            <br />
            Try before you pay — every governorate.
          </p>
        </div>
        <div>
          <p className="eyebrow">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/collections/hoodies">Hoodies</Link></li>
            <li><Link href="/collections/pants">Pants</Link></li>
            <li><Link href="/pages/summer-26">Summer ’26</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Help</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/pages/faq">FAQ</Link></li>
            <li><Link href="/pages/faq#sizing">Sizing</Link></li>
            <li><Link href="/pages/faq#tbpy">Try Before You Pay</Link></li>
            <li><Link href="/pages/about-us">About</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="https://wa.me/201050027773" target="_blank" rel="noopener noreferrer">WhatsApp +20 105 002 7773</a></li>
            <li><a href="mailto:viddawear@gmail.com">viddawear@gmail.com</a></li>
            <li><a href="https://www.instagram.com/vidda.wear" target="_blank" rel="noopener noreferrer">Instagram @vidda.wear</a></li>
            <li><a href="https://www.tiktok.com/@vidda.wear" target="_blank" rel="noopener noreferrer">TikTok @vidda.wear</a></li>
            <li><a href="https://www.facebook.com/share/1DRa2mKRNo" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li>Alexandria, Egypt</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-wrap px-5 py-5 text-xs opacity-60">
          © {new Date().getFullYear()} VIDDA WEAR. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
