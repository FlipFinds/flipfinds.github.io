# Website redesign validation — October 4, 2026

This supersedes the initial color-consistency pass in PR 60. The redesign uses the existing Hugo/PaperMod architecture and Forest & Cream brand, with a new product-led homepage, shared navigation and footer, purpose-built product/tools/resources hubs, clearer article hierarchy and self-hosted Inter/Poppins fonts. Real app screenshots remain interactive. The download page now places both store buttons immediately after its introduction.

## Functionality retained

- Seven calculators retain their existing engine, inputs, editable marketplace assumptions, result states and copy action.
- Store URLs still use the shared URL builder, Android campaign referrer and device preference. Home hero/footer and download-page placement labels remain intact. Optional web signup remains gated by the existing configuration.
- Analytics, consent, attribution, workbook files, embed, sitemap, robots, canonicals, titles and structured data implementations are unchanged. Internal link destinations remain reachable. No mobile app/backend changes.
- Local/Cloud distinctions and estimate-versus-recorded-sale qualifications remain visible. Screenshots are labeled as examples; no invented testimonials, customer counts or pricing.

## Validation

- Hugo production build and validator pass: 51 indexable sitemap URLs, 106 HTML documents, 52 structured-data documents, no errors or images missing dimensions.
- All 11 existing calculator, consent, attribution and device-routing tests pass against the actual preview build (`SITE_BUILD`). Scoped website ESLint: zero errors/warnings.
- Browser checks: home, calculator, product, tools, guides, resources, pricing, download and embed at 1280, 390 and 320 pixels. All 27 checks: no horizontal overflow or broken images, one H1 per page. Public pages retain one primary navigation; embed retains none. Desktop and mobile screenshots inspected, plus the complete homepage.
- Screenshot controls update image, caption and pressed state; FAQ expands. Corrected focus-induced scrolling inside the screenshot showcase. Keyboard skip navigation moves focus to the main landmark.
- Mobile calculator: $40 sale, $10 item, $5 shipping, $0.75 supplies, custom 10% fee and no fixed fee returns $20.25 profit. Zero investment leaves ROI undefined; missing item cost leaves results undefined and disables copy.
- Download links visible around 545–598px from the top at 320px width, with `download_page` attribution preserved.
- Final mobile Lighthouse: homepage **98 performance / 100 accessibility / 100 best practices / 100 SEO**, LCP 2.3s, CLS 0.007. Calculator **98 / 100 / 100 / 100**, LCP 2.2s, CLS 0. These are local lab measurements, not field Core Web Vitals or evidence of improved acquisition.

## Maintenance and limits

Shared visual rules live in `assets/css/extended/site.css`. Hub cards live in `data/design_hubs.json`, rendered by section templates; their hub introductions are owned by those templates. Existing content front matter continues to own SEO titles, descriptions and intent. Change the section templates when editing visible hub introductions. Article content remains Markdown.

Fonts are Latin WOFF2 subsets of the app's existing Expo Google Fonts Inter (400/600) and Poppins (600) assets, approximately 53 KB combined; OFL licenses are included under `static/fonts/`. Fonts are served locally and introduce no third-party font requests. Screenshot cropping is CSS presentation of existing assets, not newly generated app screens.

PR 60 is prepared for owner design review. **Do not merge or deploy without approval.** The preview runs at `http://127.0.0.1:1315/`. After approval, verify representative production pages and measurement again. Physical iPhone/Android store opening, Safari Smart App Banner and fresh-install attribution still require real devices. Existing launch follow-ups for reporting maturity and external account access are not closed by this visual redesign.

## Current screenshot refresh

The hero now uses fresh native Inventory, Item profit and Analytics captures with a full phone frame and a genuine item-profit detail. Fictional data is labeled, and only the example inventory photographs are generated. See [capture provenance and validation](app-showcase-assets.md). This supersedes the older screenshot-cropping description above. The earlier Lighthouse results predate the new assets; no new performance score is claimed. Build, validator, all 11 tests and scoped lint passed for the refresh; home/product layouts and controls were checked at desktop and mobile widths.
