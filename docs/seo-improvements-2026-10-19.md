# SEO improvements — October 19, 2026

## Scope

Improve the existing public acquisition pages without changing app access,
marketplace math, billing, analytics consent or private-dashboard indexing.
Adds contextual resource links, descriptive titles, genuine product screenshots,
a public desktop product page, reproducible Mercari examples and a dynamic sale
breakdown. Modification dates change only on edited content pages.

## Validation

- Hugo production build and site validation: 54 sitemap pages, no broken links,
  missing image dimensions or metadata/schema validation errors.
- Existing measurement, marketplace-math and workspace-launch tests pass; a new
  test checks the four published Mercari examples against the shared engine.
- Browser checks: $30 sale, $5 shipping collected, $8 item, $5 label and $0.50
  packaging show $3.50 fee, $31.50 proceeds and $18 profit. Free shipping gives
  $13.50 profit; a $50 purchase preserves a -$28.50 loss. Clearing item cost
  removes the breakdown. Screenshot selector updates both source and srcset.
- Homepage and desktop product page inspected visually in the desktop browser.
- Root app lint reproduces 20 existing worker no-undef errors for atob, crypto
  and TextEncoder; this patch does not edit those files. Marketing JS syntax
  checks pass.

The breakdown uses existing revenue, sellerFees and invested outputs. Buyer
shipping is excluded for Poshmark by the existing engine; collected tax is not
seller revenue. Optional blanks retain the calculator's zero-for-planning
behavior, which is now explained. A missing required item cost is not presented
as confirmed profit. No financial amounts are added to analytics events.

## Performance evidence and remaining checks

The inventory product page now follows the genuine example bag screenshot from
purchase/location entry through external listing and Mark Sold. Field/action
wording was checked against AddItemScreen.js, ItemDetailScreen.js and the shared
item type. The example explicitly uses quantity one and verifies
$45 - $12 - $6.10 - $6 = $20.90 after those entered costs. It does not imply that
packaging or every business expense has a supported dedicated app input. Local
mobile and Pro/Cloud desktop requirements are explained alongside the workflow.

Follow-up content review added a five-item, $30 haul reconciliation example to
the existing guide. It checks allocation totals, physical stock, two completed
sales, missing label expense, and the difference between $23 sold-item profit
and $5 cash remaining for the whole haul. All figures are hypothetical; seller
fees are stated example amounts, not a marketplace-rate claim. The guide keeps
its URL and original publication date. Site validation and arithmetic checks
pass; browser preview confirms both tables and the workbook link render.

The homepage now offers 384/640px phone screenshots and 640/1280px dashboard WebP
sources with responsive sizes. Generated dashboard variants are 23,054 and
69,160 bytes versus the former approximately 140 KB JPEG. Small inventory and
profit variants are 31,414 and 20,100 bytes. Actual selection depends on viewport
and device pixel ratio; byte savings do not establish an LCP improvement.

The earlier public mobile lab report scored 78 with 6.3s LCP and no real-user
dataset. It identified the hero heading; image warnings alone do not diagnose
that delay. No production LCP retest or real-device validation is claimed here.
After publication, repeat the same mobile PageSpeed run, inspect its trace, and
check phone layouts and screenshot readability. Keep hosting unchanged unless
new evidence identifies a hosting problem.

## Distribution preparation

Two resources to share when outreach is authorized:

| Resource | Useful, verifiable example | Canonical destination |
|---|---|---|
| Free Excel inventory workbook | 100 prepared rows; Sold-only completed-cost results; $40 sale example with $20.25 profit | https://flipfinds.net/resources/inventory-template/ |
| Maximum-buy-price calculator | Enter an expected sale and your own target; costs and editable fee assumptions determine the ceiling | https://flipfinds.net/calculator/max-buy-price/ |

Prepare a demonstration using illustrative inputs and the public page screenshot.
Prioritize reseller educators and curated resource pages that serve those exact
needs. Check the existing ThriftingBoard and FleaMarketFlipper outreach records
before contacting anyone. No outreach, paid links, submissions or new recurring
automation is part of this patch. Do not promise returns or describe a buy
ceiling as a purchase recommendation.

## Publication and measurement

This branch is prepared for review; merging main deploys GitHub Pages. No merge
or deployment is included. Preserve the already-submitted homepage and desktop
guide indexing requests instead of repeatedly requesting them again.

After release, verify the new desktop URL, canonicals and sitemap dates live.
Record the release date, then inspect indexing separately from search results.
Compare complete 28-day Search Console windows for product pages, calculators
and workbook separately. Confirm consented event receipt before using CTA or
download counts as conversion evidence. A download click is not an install or
subscription. Independent editorial discovery remains an external task, and
ranking or impression improvements cannot be guaranteed.
