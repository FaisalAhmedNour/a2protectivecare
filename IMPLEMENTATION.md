# Implementation plan and delivery notes

The workspace was empty: no repository, framework, assets, brand guidelines, environment, or tests. The reference URL could not be retrieved. No existing work is replaced.

1. Foundation: Next.js App Router, strict TypeScript, server-rendered pages, CSS design tokens, green identity confirmed by the user, responsive navigation/footer. Business data remains explicitly sample content until approved.
2. Homepage: editorial split hero, category collection, featured catalog, story, values, team placeholders, gallery, contact call to action.
3. Commerce: typed category/product repository, search/filter/sort/load more, gallery/detail routes, validated localStorage bag, optional BDT prices, customer capture, phone-keyed customer upsert, server-saved inquiries, and WhatsApp handoff after persistence.
4. Content: about, team, gallery with keyboard dialog and image/video records, contact API, draft privacy/terms, custom 404, and a protected `/admin` control room for products, categories, customers, contacts, team, gallery, and inquiries.
5. Server/data: MySQL schema and repository interfaces are available through `DATABASE_URL`; without it, a local in-memory adapter keeps development usable. Admin sessions use signed HTTP-only cookies and environment-seeded credentials. Light/dark/system theme preference is persisted safely.
6. SEO/performance/QA: per-route metadata, canonical/OG/Twitter, sitemap/robots, no invented structured offers, local responsive imagery, lint/typecheck/production build, 12 unit tests, and 28 browser tests across all routes, admin flow, bag, filters, gallery, contact, navigation, accessibility, storage resilience, zoom, and responsive overflow.

## Content launch requirements

The user confirmed the name A2 Protective Care, green brand color, and medicine product type. Replace sample products/concept images, the provisional logo, team placeholders, company story, contact details, and legal drafts with verified business content. Supply a real WhatsApp number and contact service endpoint. Never claim the form sent a message without a successful configured service response. Sample mode is noindex until explicitly disabled in site settings.
