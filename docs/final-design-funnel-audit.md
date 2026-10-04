# Final design and acquisition audit — October 4, 2026

## Decision

Ready for owner approval to deploy the website redesign. No release-blocking defect was found in the tested website paths. This is a local/review-branch assessment, not confirmation that the new design is live or that acquisition has improved. Deployment and merge remain unapproved.

## Findings resolved

1. Screenshot delivery was larger than necessary. Reduced native capture derivatives from 800 to 640 pixels and deferred the supporting profit detail. Inventory asset decreased from 96,096 to 73,224 bytes; profit detail from 80,082 to 55,968 bytes. The full-resolution source captures are retained.
2. The inherited missing-page template displayed only “404.” Added a branded explanation and direct home, calculator, download and support recovery links. The page remains noindex. The local server serves `/404.html` as a normal file; actual unknown-route HTTP status must be checked on production after release.
3. Added a meaningful acquisition-event regression test: iOS, Android, resource and internal-navigation clicks retain event names and placement; resource events do not include item titles or amounts.

## Design and conversion review

- Shared Forest & Cream palette, typography, navigation and footer remain consistent. Homepage hierarchy leads from product explanation to app download, free calculator, workflow, resources, FAQ and final download CTA.
- Reviewed home, calculator, product, tools, guides, resources, pricing, download and workbook page at 1280, 390 and 320 pixels: all 27 checks passed with no horizontal overflow, broken images or garbled visible text, and one H1 per page. Full homepage and representative mobile pages visually inspected.
- Native screenshot controls work and use labeled fictional data. Current Free-plan Analytics is shown honestly. No fabricated customer outcomes or Pro access. The small phone text is supporting product evidence; the enlarged detail and surrounding copy carry the message.
- Both store buttons remain available; mobile download-page buttons appear approximately 504–512 pixels from the top at 390px width. Device preference behavior is covered by tests. Local use, optional Cloud and manual calculator-to-app entry are explained accurately.
- Pricing is deliberately conservative and sends users to the app for available offers. A verified Free/Pro feature comparison could improve decision-making later, but should not be invented or block this visual release.

## Validation

- Hugo build and site validation: 106 HTML documents, 51 indexable sitemap URLs, 52 structured-data documents; zero errors or images missing dimensions. Validator checks internal targets/fragments, canonical alignment, titles/descriptions and orphan sitemap pages.
- All sitemap pages have Open Graph title, description, URL and image. Robots permits crawling and references the canonical sitemap. Missing-page robots: `noindex, follow`.
- All **12** calculator/measurement tests pass; scoped website ESLint passes.
- Browser journey: home calculator CTA opens calculator; custom example ($40 sale, $10 cost, $5 shipping, $0.75 supplies, 10% fee, no fixed fee) returns $20.25 profit. Copy succeeds. Zero investment leaves ROI undefined; missing cost disables copy. FAQ and new recovery links work.
- Browser consent controls visibly decline and regrant. Generated consent-wrapper tests confirm no GA collection before permission, revocation behavior and sanitized payloads. Local previews intentionally do not load production GA. Legacy anonymous counters remain independent of GA consent, as disclosed in the privacy policy; “No thanks” is not a promise of zero network requests.
- Public App Store and Google Play destinations respond HTTP 200. Workbook download responds HTTP 200 (13,744 bytes). Existing live `/app-ads.txt` responds HTTP 200; this does not prove AdMob has recrawled or verified both apps.
- Fresh mobile Lighthouse: **home 97 performance / 100 accessibility / 100 best practices / 100 SEO**, LCP 2.42s, CLS 0.0074; **calculator 98 / 100 / 100 / 100**, LCP 2.18s, CLS 0.0002. Local lab measurements, not field Core Web Vitals. Homepage first pass was 95 before image optimization; individual runs vary.

## Limits and production acceptance

- Web store-click events measure intent, not successful installs or first-item activation. Apple provider token is still blank in configuration; iOS campaign attribution is incomplete. Android URLs retain their configured campaign referrer; a real fresh install must verify downstream attribution.
- No authenticated GA4/BigQuery, Search Console, Bing or AdMob account re-audit was performed in this pass. Earlier export/indexing/ownership follow-ups remain separately tracked; their current state is not asserted here.
- Before treating release as operationally complete: after approved deployment, verify representative live routes and real 404 status, consent-controlled GA event delivery, live download links and real iPhone/Android store handoff. Confirm reporting after the normal processing window. Local tests cannot establish acquisition lift or traffic volume.
- No production changes, ClickUp updates, mobile app source changes or backend changes made.

Evidence: parent workspace `outputs/final-design-audit-2026-10-04/` contains responsive results, endpoint results, Lighthouse reports, lint results and screenshots. Capture provenance and image-generation prompts remain in `docs/app-showcase-assets.md`.
