# A2 Protective Care

Next.js App Router + strict TypeScript medicine catalog and company portfolio. Green visual identity, original generated concept images, responsive local image variants, locally hosted Manrope, and WhatsApp inquiry ordering. There is no online payment system or admin backend.

## Run

Requires Node 20.9+ (developed with Node 24).

```sh
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

On Windows PowerShell with script execution restricted, use `npm.cmd` instead of `npm`. Browser tests use installed Microsoft Edge and the local preview at port 3000. Override `TEST_BASE_URL` to test a production preview. `node scripts/screenshots.mjs` saves desktop/tablet/mobile QA captures.

## Configuration and launch

Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_WHATSAPP_NUMBER` to an international number with country code, and `NEXT_PUBLIC_SITE_URL` to the canonical origin. These are public configuration, never secret credentials. Next.js static builds embed these values, so rebuild after changes.

`src/data/site.ts` owns business contact settings, the WhatsApp message greeting/closing, social links, and `sampleMode`. The supplied business name is **A2 Protective Care**, brand color **green**, product type **medicine**. No verified products, contact number, address, staff, business history, or licenses were supplied. All missing facts are visibly identified. Keep `sampleMode: true` (noindex/disallow) until content is approved; then set it to false and rebuild.

The later brand brief is incorporated: configurable Category One–Four placeholders, Order on WhatsApp CTAs, a global floating WhatsApp control, optional email and subject, hidden empty specifications, neutral team placeholders, and no empty/fake social links. Brand copy is in `src/data/content.ts`; structural/UI labels remain with their components. Product specifications use `{label, value}[]`; optional product fields may be omitted.

Replace the typed entries in `src/data/products.ts`, `categories.ts`, `team.ts`, and `gallery.ts`. Product prices and SKU are optional; currency formatting is centralized. Do not add unverified health claims, ratings, dosage information, or certifications. Product schema is intentionally omitted for illustrative products with no verified offers. Website schema contains only the confirmed name and origin.

Replace generated imagery in `assets/` with approved real photographs. Update the image processing script for the new image crops and run `npm run images`. It writes responsive WebP variants in `public/images`; the Next Image custom loader serves local sizes without requiring an image CDN or runtime server. See `assets/PROVENANCE.md` for concept image prompts and provenance.

## Order architecture

`src/lib/whatsapp.ts` owns phone validation and message/URL generation for single and multi-product inquiries. It encodes names, quantities, links, optional SKU and prices. An unconfigured number opens a copyable inquiry, never a fake destination. `wa.me` supports WhatsApp's device-specific web/app handoff. Actual mobile app handoff cannot be verified without a confirmed business number and a physical device.

The external order store in `src/lib/order-store.ts` uses React's `useSyncExternalStore` for safe hydration, persists only product IDs and quantities, merges/caps quantities at 99, discards unknown products, handles corrupt/blocked storage, and synchronizes browser tabs. Prices and full product objects are never trusted from localStorage. The bag is device-local and remains until cleared; it is not an accepted order.

## Contact service

`src/lib/contact.ts` validates inputs and delegates delivery to a configured HTTPS endpoint. With no endpoint it reports **not sent**. Set `NEXT_PUBLIC_CONTACT_ENDPOINT` to a server endpoint accepting JSON `{name,phone,email,subject,message}` and returning HTTP 2xx with `{ "success": true }` only after accepting delivery. Configure CORS for this site's origin. The receiving backend must independently validate input, rate-limit requests, prevent abuse, and keep mail/API credentials server-side. The frontend uses a 15-second timeout and preserves form values on errors. No email backend has been invented or silently connected.

Map, social links, legal text, and team profiles remain explicit content placeholders pending verified details. The privacy and terms pages are drafts to replace before launch.

## Deployment and future admin

`next build` exports server-rendered HTML and interactive islands to `out/`. The Sites manifest points at this static output. Static hosting must serve directory index files and return `404.html` for unknown routes. For a future server-backed admin, keep the public data repository interfaces, replace their internals with authenticated service access, remove `output: 'export'`, and add an authenticated `/admin` route group. Do not put administrative secrets or authorization checks only in client components.

Use `npm run build` for the complete build. Its postbuild hook adds dot-separated aliases for Next.js RSC segment payloads affected by [the upstream Windows static-export path issue](https://github.com/vercel/next.js/issues/92339). It leaves already-correct exports unchanged and prevents prefetch 404 errors on static hosting. It does not change framework internals.

Optional feature-detected WebMCP tools read or stage the same local bag; they never submit orders. No supported native WebMCP browser context was available for live validation.
