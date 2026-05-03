# vidda-web

Next.js 14 (App Router) rebuild of the VIDDA WEAR storefront.

This is **Phase 2, milestone 1** — a working scaffold with:

- TypeScript + Tailwind 3 + brand-locked design tokens (Cairo typography, ink/burgundy/ivory palette)
- App Router pages: home, links (bio replacement), Summer '26 LP, FAQ, About, PDP, PLP
- EasyOrders REST client (`lib/easyorders.ts`) with static product fallback
- SEO baseline: `generateMetadata` per page, OG tags, JSON-LD (Organization, Product, BreadcrumbList, FAQPage)
- Auto-generated `sitemap.xml` + `robots.txt`
- Preserves the contact info + schema parity from the live storefront so the migration doesn't lose SEO trust signals

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind 3 + custom brand tokens |
| Typography | Cairo (Latin + Arabic via `next/font/google`) |
| Data | EasyOrders REST API (typed client in `lib/easyorders.ts`) |
| Hosting target | Vercel (recommended) |
| Domain | `viddawear.store` (cutover in milestone 6) |

## Local dev

```bash
pnpm install
cp .env.local.example .env.local
# Add EASYORDERS_TOKEN= ... (optional; without it the static catalog is used)
pnpm dev
```

Open http://localhost:3000.

## Build & lint

```bash
pnpm build    # Production build
pnpm lint     # ESLint
pnpm start    # Production server
```

## Project structure

```
app/
  layout.tsx                    Root layout, header, footer, Org schema, metadata
  page.tsx                      Homepage
  links/                        /links — bio Linktree replacement
  pages/
    summer-26/                  /pages/summer-26 — drop LP
    about-us/                   /pages/about-us
    faq/                        /pages/faq with FAQPage JSON-LD
  products/[slug]/              PDP with Product + BreadcrumbList JSON-LD
  collections/[slug]/           PLP (hoodies / pants / summer-26)
  sitemap.ts                    /sitemap.xml
  robots.ts                     /robots.txt
components/
  site-header.tsx               Sticky black nav with Summer '26 accent
  site-footer.tsx               Real contact info from live store
  organization-schema.tsx       JSON-LD Organization (parity with EO storefront)
lib/
  easyorders.ts                 Typed EO REST client + static fallback
```

## Brand tokens (do not extend without sign-off)

| Token | Value | Usage |
|---|---|---|
| `ink` | `#0a0a0a` | Primary surface, text on ivory |
| `ivory` | `#F1ECE3` | Page background |
| `burgundy` | `#800020` | Accent, CTAs, prices |
| `sand` | `#C8B89B` | Summer '26 only |
| `slate` | `#3F4549` | Summer '26 only |
| Type | Cairo (400/500/700/800/900) | Latin + Arabic |

## Roadmap (Phase 2 milestones)

- **M1 (this commit)**: Scaffold + design tokens + page shells + EO API client + SEO baseline
- **M2**: Catalog (PDP variant selectors, PLP filters, cart drawer, EO order webhook)
- **M3**: Summer '26 LP polish + photo masters from shoot + email capture (Klaviyo or Mailchimp)
- **M4**: Checkout (EO redirect or Stripe direct)
- **M5**: SEO/analytics, sitemap submission, IndexNow, GA4, Pixel
- **M6**: DNS + SSL cutover from EasyOrders to Vercel — needs registrar credentials

## Environment variables

Create `.env.local` with:

```
EASYORDERS_TOKEN=eyJ...        # Bearer JWT from EO admin login
NEXT_PUBLIC_GA_ID=G-XXXXXXX    # Google Analytics 4 (M5)
NEXT_PUBLIC_PIXEL_ID=...       # Meta Pixel (M5)
```

The token is short-lived. For production, regenerate via the EO admin login flow and rotate via Vercel env vars.

## Migrating from EasyOrders

The live storefront at `https://www.viddawear.store` is currently served by EasyOrders. This Next.js build mirrors:

- Per-page metadata + canonical from `header_code_current.html`
- Organization schema (logo, sameAs, contactPoint, address) — parity verified
- Product schema (sku, price=999, currency=EGP) — parity verified
- Real contact info: WhatsApp `+20 105 002 7773`, email `viddawear@gmail.com`, IG/TikTok/FB
- Branding: ink/burgundy/ivory palette, Cairo typography, pill CTAs

DNS cutover plan (M6):

1. Deploy to Vercel under preview URL
2. QA sign-off on all routes
3. Add `viddawear.store` to Vercel project (DNS A/AAAA records to Vercel)
4. Issue SSL via Vercel (auto)
5. Decommission EasyOrders custom domain (keep storefront alive at the EO subdomain as a fallback for 30 days)

## License

Private — © VIDDA WEAR. Not for redistribution.
