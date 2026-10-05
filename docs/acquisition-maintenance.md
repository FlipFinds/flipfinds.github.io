# Acquisition site maintenance

This remains a Hugo site using the existing GitHub Pages workflow and PaperMod theme. The general calculator stays at `/calculator/`; its six intent pages use the same partial and math engine. Calculator `content/calculator/_index.md` is a branch bundle so Hugo publishes its children.

## Shared configuration

- `data/acquisition.json`: verified store IDs/URLs, campaign clusters, optional Apple provider token and future web entry point. Keep the Apple token empty until the real token is available. Enabling web requires both `webSignupEnabled` and an HTTPS `webSignupUrl` with a working receiving flow.
- `data/fees.json`: US fee assumptions, authoritative sources, actual review date and threshold rules. Before a fee change, read the official sources, update both the explanatory note and applicable rule values, and test order/tier thresholds. Review before release and when a marketplace announces a change. Custom inputs remain available.
- `layouts/partials/acquisition-cta.html`, `store-url.html`, `acquisition-related.html`: contextual conversion and linking. Front matter `related` entries identify existing page paths; do not copy calculator formulas into content pages.
- App branding originates in the app's `src/theme/brandTokens.js`. `assets/css/extended/site.css` mirrors its Forest & Cream colors and web font stacks. Homepage and calculator variables reference these shared values; all public pages use the same cream background, navigation and footer. Keep white cards, green actions and readable content widths consistent when adding pages. The embedded calculator intentionally omits the site navigation/footer.

## Validation

Run Hugo 0.156.0 extended, then:

```text
hugo --gc --minify
python scripts/validate_site.py public
node --test tests/*.test.cjs
```

Set `SITE_BUILD` if the build destination differs from `public`. Run `node --check` on each `assets/js/*.js` file. No package lint command is configured in this Hugo repository; syntax checks, the site validator and focused math/privacy tests are the release checks. Pull requests build and validate; deployment is restricted to the existing main/manual workflow.

When working inside the app checkout, its existing ESLint can also check these scripts and tests. Browser/CommonJS globals are explicitly declared in the standalone scripts. Scope that lint run to website source; the app-wide command also includes generated review builds and unrelated app code.

The site validator checks canonical sitemap entries, indexability, unique titles/descriptions, one H1, internal targets/fragments, image alt text, schema JSON and breadcrumb positions, and reachability from home. It also reports images missing dimensions. It does not prove Google rich-result eligibility or production HTTP redirects.

Check simulated mobile performance and visually inspect home, calculator, product and resource pages. Scores alone can miss contrast/layout problems. Check blank/zero/loss inputs, fee boundaries, keyboard controls, consent decline/allow/revoke, and store URLs. Physical iOS/Android store opening, Smart App Banner and a fresh Play install require devices.

## Spreadsheet and embed

The downloadable workbook has 100 rows, standard Excel formulas, status validation and no external connections. Actual profit requires Sold status and all seven numeric inputs; unknown is blank and zero is explicit. Zero investment leaves ROI blank. Test a normal sale, a loss, a free item, a missing cost and an unsold item in Excel/Google Sheets before relying on native compatibility. Extend by copying a complete prepared row.

The noindex `/embed/calculator/` reuses the shared engine. `/resources/embed-calculator/` supplies iframe instructions and an approved referral campaign. New partner campaign values must be explicitly allowlisted. The iframe has no parent-page scripting or automatic inventory transfer.

## Measurement boundary

Google Analytics loads after opt-in on `flipfinds.net`. Local previews do not load production GA or increment existing counters. Events use static page context and allowlisted fields; monetary inputs, item text and arbitrary URL query values are excluded. Revocation disables subsequent GA collection and clears stored attribution. Counter page/store clicks remain aggregate events under the existing counter architecture; they are not users or installs.

First/current campaign values accompany a future web signup link only after consent. The receiving application must validate these URL values and own signup completion, activation and billing events. Public store and web links record a click, not an install or completed signup. Private reporting instructions belong in the existing private growth repository.

## Approved deployment and discovery

Obtain the owner's approval before merging to main or invoking production deployment. The workflow snapshots the existing production sitemap before deployment, publishes the validated site, then sends IndexNow the union of previous/current canonical URL sets. Removed sitemap URLs are included so their noindex/redirect changes can be discovered. The root IndexNow key is public ownership evidence, not a credential.

`python scripts/indexnow.py notify --dry-run --build public` previews the notification without sending it. A real notification checks the deployed ownership key and sitemap. If notification fails after deployment, the site can still be live; inspect the job and retry only the notification after verifying deployed content. Never rerun an old build blindly.

After deployment, verify HTTP 404s, known legacy redirects, app-ads.txt, store destinations, opted-in GA event receipt, Search Console representative canonicals/sitemap and Bing ownership. Field Core Web Vitals, platform campaign reporting and ad verification require post-launch evidence. Preserve the prior working legacy ad file until canonical-domain verification succeeds.
