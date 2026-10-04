# Current app showcase — October 4, 2026

## Capture provenance

The homepage and product hub use `assets/images/app/inventory.png`, `item-profit.png`, and `analytics.png`. These are native Android captures at 1080 × 2400 from the current 1.0.52 JavaScript source (mobile commit fa2dab3), running in the existing 1.0.51/build 63 development client on the FlipFindsAnalytics emulator, with production-mode JavaScript and analytics environment set to test. This is not physical-device release validation.

Eight fictional inventory records were loaded into an initially empty local emulator store. Cloud was disabled. No customer records, production database, mobile source, purchase state or entitlements were changed. Analytics retains its actual Free-plan / Pro-locked presentation. The example bag sold for $45 with $12 cost, $6.10 fees and $6 shipping; the app calculates $20.90 realized profit and 46% rounded margin. Six sales total $111.40 profit, with two active items at $89 list value. These are examples, not customer outcomes or promised returns.

Hugo generates 800-pixel-wide WebP derivatives. CSS frames the full captures and enlarges the actual profit section; no app labels or amounts were painted over. Mobile places the detail beneath the phone. Existing screenshot controls, captions and pressed states remain, with no automatic rotation or new tracking events.

## Illustrative item photos

Only the bowl, camera and bag photos were created with the built-in image generation tool. They were displayed through the app before capture; no app UI was generated. Originals are retained under the parent workspace's `outputs/site-redesign-2026-10-04/example-photos/` as `bowl.png`, `camera.png`, and `bag.png`.

Prompt for each:

> Use case: product-mockup. Create a square clean studio product photograph of [subject]. This is a fictional example inventory item for screenshots of a resale tracking app. One object centered, entirely visible, on a warm off-white seamless background. Soft natural side light, realistic materials, understated professional catalog photography. No text, branding, logos, collage, UI, people or watermark.

Subjects: “a simple cream stoneware serving bowl with subtle brown speckles”; “an unbranded compact vintage black and silver 35mm film camera”; “a muted olive canvas weekender bag with brown handles”.

## Validation and limits

Hugo build, site validator (106 HTML / 51 sitemap pages / 52 schema documents), all 11 existing tests, and scoped website ESLint pass. Home/product responsive checks cover 1280, 390 and 320 pixels; screen switching and keyboard activation checked. Store destinations, attribution, calculators and consent are preserved.

The shared stylesheet was normalized for readability. Two pre-existing garbled CSS glyphs were replaced with Unicode escapes for the FAQ minus and mobile capability checkmarks. Earlier Lighthouse scores in the redesign report predate this asset refresh and are not new measurements. No production deployment. Physical-device purchases, ads and native media behavior are outside this website presentation check.
