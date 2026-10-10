# Dashboard website launch — 2026-10-09

Both mobile apps are live, and the owner authorized publishing the full marketing site on its existing GitHub Pages host. Hosting migration remains deferred.

`webSignupEnabled` is now true. Production entries point to https://app.flipfinds.net. The homepage includes an actual dashboard screenshot with synthetic example data and a three-step Cloud setup guide. Existing app-store routes, calculators, analytics consent, and canonical URLs remain intact.

Validation: production Hugo build; 105 HTML pages and 53 indexable sitemap pages validated; 14 tests passed; JavaScript syntax checks and diff whitespace checks passed. Desktop homepage and mobile guide visually reviewed. No payment, authentication, Firebase rules, or mobile release changes are included.

Rollback: the previous production commit is 3fd1e48. Preserve it as `backup/pre-dashboard-launch-2026-10-09` before publishing. To undo this launch, revert the launch merge on main and let the existing Pages workflow redeploy. Do not reset or force-push main. To hide only dashboard entry points, set webSignupEnabled false and run the same build/tests.

Local preview: run Hugo with config/dashboard-preview.toml. While the production flag is true, links intentionally use the live service. Never publish loopback URLs.

Post-deploy: verify homepage Dashboard and Get Pro links, pricing, download page, FAQ, and /guides/desktop-dashboard/ on the public domain. A CTA click is not a verified purchase. Native announcement preparation is a separate dashboard_onboard branch and requires a future mobile build and device QA.
