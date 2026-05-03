# Photo Masters — VIDDA WEAR

When the Summer '26 shoot lands, drop the files into the paths below. The Next.js LP picks them up automatically because the URLs in `app/pages/summer-26/page.tsx` reference these slugs.

> **Single source of truth:** all Summer '26 hero, lookbook, and product imagery should live under `/public/summer26/`. Do not commit the original RAW/PSD files — only export-ready JPG/PNG/WEBP at the sizes below. Master files live elsewhere (Google Drive, Dropbox, etc.).

## File structure

```
vidda-web/public/summer26/
  hero.jpg                     2400 × 3000   ≤ 600 KB    (hero background, mobile-first crop OK)
  hero@2x.jpg                  3600 × 4500   ≤ 1.2 MB    (retina hero, lazy)
  film-poster.jpg              1920 × 1080   ≤ 400 KB    (placeholder before video lands)
  lookbook-01.jpg              1200 × 1600   ≤ 350 KB    (lookbook grid, position 1)
  lookbook-02.jpg              1200 × 1600   ≤ 350 KB    (lookbook grid, position 2)
  lookbook-03.jpg              1200 × 1600   ≤ 350 KB    (lookbook grid, position 3)
  product/
    oversized-tee.jpg          1200 × 1500   ≤ 300 KB
    oversized-tee-back.jpg     1200 × 1500   ≤ 300 KB
    boxy-tee.jpg               1200 × 1500   ≤ 300 KB
    light-hoodie.jpg           1200 × 1500   ≤ 300 KB
    linen-shorts.jpg           1200 × 1500   ≤ 300 KB
    tank.jpg                   1200 × 1500   ≤ 300 KB
    summer-set.jpg             1200 × 1500   ≤ 300 KB
  detail/
    fabric-macro-01.jpg        1600 × 1600   ≤ 400 KB    (texture close-up)
    cuff-snap.jpg              1600 × 1600   ≤ 400 KB
    stitch.jpg                 1600 × 1600   ≤ 400 KB
  bts/
    workshop-01.jpg            1200 × 1500   ≤ 350 KB    (Alexandria atelier)
    workshop-02.jpg            1200 × 1500   ≤ 350 KB
```

## Color & exposure rules

- **Backgrounds:** ink `#0a0a0a` for hero / cinematic shots; ivory `#F1ECE3` for clean product cutouts.
- **Skin tones:** keep warm — Mediterranean light, not cold studio. Test print on phone before approving.
- **Burgundy `#800020`:** at most one burgundy frame per row of the IG grid (also applies to the LP gallery — don't stack two burgundy crops side-by-side).
- **No filters:** rely on grading in Lightroom or DaVinci. No Instagram presets. No "moody fade" presets.
- **No watermarks** on any master file.

## Naming convention

- All lowercase, kebab-case.
- Use SKU slug as the prefix for product shots: `s26-oversized-tee.jpg` rather than `oversized-tee.jpg`. The current LP uses the short version (`oversized-tee.jpg`) for clarity, but when you have official SKU slugs from EasyOrders, prefer the SKU prefix to avoid drift.

## When you ship the files

1. Export to the sizes above. Compress with [Squoosh](https://squoosh.app/) (MozJPEG q=80–85, or WebP q=80) — the file-size budgets in the table above are real, not aspirational.
2. Drop into `vidda-web/public/summer26/` (mirroring the structure exactly).
3. Open `app/pages/summer-26/page.tsx` and swap the placeholder URLs:
   - `HERO` → `/summer26/hero.jpg`
   - `GALLERY` → `["/summer26/lookbook-01.jpg", "/summer26/lookbook-02.jpg", "/summer26/lookbook-03.jpg"]`
4. Open `components/summer26-product-grid.tsx` and swap each piece's `image` to its `/summer26/product/<slug>.jpg` path.
5. Run `pnpm build` locally to confirm no images 404. Push. CI green = ship.

## Hero film (when ready)

- Master: 1920 × 1080, ProRes or H.264, 8–15 seconds, no audio (autoplay-friendly).
- Compressed: 1280 × 720 H.264 MP4, ≤ 4 MB, looped.
- Place at `public/summer26/film.mp4` and `film-poster.jpg`.
- Wire into the hero by replacing the background `<div>` with a `<video autoPlay muted loop playsInline>`.

## What to avoid

- Don't ship 4K masters into `/public/`. Compress aggressively.
- Don't ship images with embedded EXIF GPS tags. Strip metadata on export.
- Don't ship images larger than 1.2 MB (hero retina) or 400 KB (anything else). The site's whole budget is ~3 MB above-the-fold, including JS.
- Don't ship images via `dangerouslySetInnerHTML` or base64 data URIs. Use the `<Image />` component or `background-image: url()` with a path.
