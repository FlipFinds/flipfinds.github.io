# Site consistency validation — October 4, 2026

The homepage and calculators previously used a dark palette and separate navigation, while other pages used the light PaperMod presentation and list pages used a gray background. This patch uses the app's Forest & Cream values throughout, with one shared header/footer, consistent cards, typography, gutters and a compact phone header. Existing Hugo templates, calculator logic, attribution, consent and store destinations remain in place. Collection still stays off in local previews.

Validation against the final production build:

- Hugo build and site validation pass: 51 indexable sitemap URLs, 106 HTML documents, 52 schema documents, no validator errors or images missing dimensions.
- All 11 existing calculator, consent, attribution and device-routing tests pass. `SITE_BUILD` points to the new build rather than the older local `public` directory.
- Scoped website ESLint has zero errors/warnings. The broader app lint's existing unrelated failures are outside this patch.
- Browser review of home, calculator, product, tools, guides, resources, pricing, download and embed at 1280, 390 and 320 pixels: 27 checks, no horizontal overflow or broken images, one H1 and the same cream background. Public pages have one shared navigation; the embed omits it. Desktop and phone screenshots were visually reviewed.
- Phone calculator check: the documented custom-fee example returns $20.25. Zero investment leaves ROI undefined.
- Final mobile Lighthouse: home and calculator score 100 in performance, accessibility, best practices and SEO. Home LCP 1.7s/CLS 0.007; calculator LCP 1.7s/CLS 0. These are local lab measurements, not field Core Web Vitals or evidence of acquisition lift.

The visual patch is prepared for review. Merge/deployment requires the owner's approval. Verify production assets and representative pages after deployment. Physical store opening, Safari Smart App Banner and fresh-install attribution still require real iOS/Android devices.
