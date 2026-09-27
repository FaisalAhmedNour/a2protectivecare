# A2 Protective Care QA

Validated 27 September 2026 on Windows with Node 24, Next.js 16.3.6, and headless Microsoft Edge.

## Results

- ESLint: passed without warnings.
- Strict TypeScript: passed.
- Production static build: passed; all required routes, nine sample product pages, four placeholder category pages, 404, sitemap, and robots are emitted.
- Unit tests: 8 passed. Includes single/multiple WhatsApp inquiries, Unicode and URL encoding, quantities, optional pricing/SKU, invalid phone numbers, corrupt/stale order records, optional contact fields, and explicit contact-service acknowledgement/failure paths.
- Browser suite: 26 passed against the production export. Includes navigation and local link checks, search/filter/sort/load more, thumbnails, order-list persistence/quantities/remove/clear, multi-tab sync, blocked/corrupt storage, gallery keys/focus, contact validation, absent backend state, image failure, and floating WhatsApp behavior.
- No page JavaScript errors or browser console errors on the checked production routes; image decoding and internal-link responses passed.
- No horizontal page overflow at 320, 375, 390, 430, 768, 1024, 1280, 1440, or 1920 pixels across the nine major page types. Mobile navigation also works at 200% text size.
- Axe scans: no WCAG 2 A/AA or WCAG 2.1 AA violations on home, products, product details, categories, about, team, gallery, contact, and the gallery dialog. Automated scans are not a full accessibility certification.
- Desktop/tablet/mobile screenshots saved in `qa/screenshots/` and visually inspected. This generated evidence is excluded from Git. The mobile WhatsApp CTA uses a separate bottom strip, with page-end and focus-scroll spacing; native dialogs remain above it.

## Issues found and resolved

- Nested inquiry Escape events also closed the order dialog. Stopped cancellation propagation; checked focus restoration.
- Closed dialog content created duplicate text selectors and excess hidden UI. Dialog contents now mount only while open.
- Initial localStorage hydration caused effect-triggered cascading renders. Replaced it with a synchronized external store.
- Enlarged text overflowed grids and the logo. Added shrink/wrap constraints, content-aware mobile columns, and fixed logo sizing.
- Next.js Windows static exports nested RSC segment payloads, causing prefetch 404 errors. A reproducible postbuild step writes the dot-separated aliases expected by the client router; the production console/link test passes. See upstream issue linked in README.
- The Sites build wrapper could not locate its npm shim in this Windows environment. The project's native `npm.cmd run build` completed successfully, including the postbuild normalization.

## Content and integration boundaries

- Confirmed: A2 Protective Care, green brand color, Bangladeshi brand, medicine product type.
- Category One–Four, all product listings, team records, history/mission/vision/values, contact details, map, and legal policies are explicit placeholders or drafts. No fabricated offers, stock, medical claims, credentials, reviews, or people are presented as real.
- Generated concept imagery is labeled, local, optimized into responsive WebP variants, and documented in `assets/PROVENANCE.md`. No reference-site assets are copied. Manrope is self-hosted.
- WhatsApp URL/message logic is tested without sending an order. A real business number and physical mobile WhatsApp/Web/Desktop handoff remain unverified because none was supplied. The unconfigured UI offers a copyable inquiry and clearly says it was not sent.
- Contact integration is a validated HTTPS service boundary, not a live email service. Success/failure paths were tested using mocked responses. Real delivery requires an endpoint with server-side validation, rate limiting, and credentials.
- Optional WebMCP tools are feature-detected. No supported native WebMCP browser context was available, so live WebMCP validation is not claimed.
- Sample mode deliberately emits noindex and robots disallow. Review content, legal drafts, contact configuration, and business requirements before a public launch.
