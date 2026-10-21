# Aggregate website statistics

Dedicated marketing-site collector. It does not touch mobile, the signed-in
dashboard, Firebase, billing, or the existing AI Workers. The public site needs
no approval popup. A checkbox on `/pages/privacy/#statistics-choice` stops future
statistics in that browser. GPC, DNT, and previous GA4 declines also suppress them.

## Data and limits

The shared allowlist is `data/measurement.json`. A request contains only event,
page category, calculator type, broad mobile/desktop layout and event-specific
detail (button placement, template name, or a load-speed bucket). The server adds
the UTC day. It atomically increments a single `daily_counts` row. There is no
event table, request timestamp, IP/UA/referrer field, user/session identifier,
advertising attribution, or public report endpoint. Unknown/extra fields are
rejected; payloads are limited to 512 bytes including chunked bodies.

Cloudflare still processes connection metadata as hosting provider. Worker
observability is disabled; do not enable request logs, Tail exports or Logpush for
this collector. Cloudflare's underlying security and operational processing is
separate from our statistics database. Review processor/data-transfer settings in
the existing Cloudflare account before activation; this design is not a blanket
certification of consent exemption in every country.

Daily cleanup removes rows older than 90 UTC days (approximately 90 days of live
data; provider backups can have a separate lifecycle). No cookies or browser
identifiers are created. Browser storage only remembers a user-chosen opt-out.
Previously denied GA4 consent is respected until the visitor explicitly changes
the statistics preference. Requests omit credentials and referrers. Collection
stays off when preferences are unreadable, on previews, or with a blank endpoint.

Counts are once per event/detail per page load. Repeated actions at the same
placement are deduplicated only in memory. Reloads count again. Blocks, failures,
bot traffic and rate limits affect totals. CORS is not authentication: someone
can forge a public ingest request. The shared rate-limit key contains no visitor
information; Cloudflare's limit is per location, not a strict global spending cap.
Do not use these approximate totals for billing, unique visitors, installs,
purchases, individual conversion journeys or advertising optimization.

## Decisions supported

| Metric | Interpretation |
| --- | --- |
| Calculator started/completed/validation failed | First interaction / first displayed valid result / invalid values; no financial amounts |
| Calculator failed | Calculator engine threw; generic category, no error text |
| Apple/Google store clicks | Interest in each store, split by predefined placement; not an install |
| Dashboard/Pro clicks | Whether visitors find those entry points; not sign-in or purchase |
| Template clicks | Download intent, not confirmed file completion |
| Demo started/completed/failed | First playback, ended event, or media error; not a viewing history |
| Load speed | Full navigation duration: under 2s / 2–4s / over 4s; not LCP or Core Web Vitals |

`page_loaded` supplies denominators by page category/tool/device. A completion
ratio means completed-result page loads divided by started page loads, not unique
visitor conversion. Do not sum button placement counts and call the result unique
people. Compare only matching date ranges and dimensions. Missing rows mean no
accepted events, not proof nobody tried; distinguish outages and disabled collection.

## Validation and release

Use Node 22.13+ or 24 for `node --test tests/*.test.cjs` after building Hugo.
Collector tests execute actual SQL in an isolated in-memory SQLite database. Use
Wrangler **4.151.3** for the following commands from the marketing repository.

1. Copy `wrangler.example.toml` to ignored `wrangler.local.toml` in this directory.
2. `npx wrangler@4.151.3 d1 execute COUNTS --local --config worker/measurement/wrangler.local.toml --file worker/measurement/schema.sql`
3. `npx wrangler@4.151.3 dev --local --config worker/measurement/wrangler.local.toml --port 8789`
4. Send synthetic requests to `/collect` with `Origin: https://flipfinds.net`.
   Browser previews never send requests. There are no production mutations in
   this local sequence. A dry-run bundle is also safe.

Production requires task-specific authorization under GEMINI.md. After approval:

1. Refresh the owner's existing Cloudflare login and confirm its account. Create
   only the dedicated `flipfinds-site-metrics` D1 database, then copy the example
   to ignored `wrangler.production.toml` with that database's real ID.
2. Apply `schema.sql` to that dedicated database using the explicit production
   config and `--remote`. Never use the app/AI Worker configs or databases.
3. Deploy only `collector.mjs` using that production config. Keep observability
   off and confirm the UTC cleanup trigger exists. No DNS migration is necessary;
   the owned Workers hostname can serve this collector.
4. Test with a synthetic event, verify exactly one aggregate increment, then set
   `data/measurement.json.endpoint` to its HTTPS `/collect` URL. Commit and rerun
   the site checks before merging/publishing. The committed blank endpoint is an
   activation gate, not an operating analytics installation.
5. Verify production collection after activation and no collection after opt-out.
   Do not claim live measurement until the database increment is confirmed.

Rollback: blank the public endpoint and publish the site, and/or disable only the
dedicated collector Worker. Keep the opt-out controls. Do not remove opt-out
preferences, restore GA4, or deploy any application components as part of rollback.

## Reading reports

Reports require authenticated owner access to the dedicated D1 database. Use the
Cloudflare D1 console or `wrangler d1 execute COUNTS --remote` with the explicit
production config. No report credentials belong in the public site.

```sql
SELECT day, event, page, tool, device, detail, total
FROM daily_counts WHERE day >= date('now','-28 days')
ORDER BY day, event, page, tool, device, detail;

SELECT tool,
  SUM(CASE WHEN event='calculator_started' THEN total ELSE 0 END) AS started,
  SUM(CASE WHEN event='calculator_completed' THEN total ELSE 0 END) AS completed,
  SUM(CASE WHEN event='calculator_validation_failed' THEN total ELSE 0 END) AS invalid
FROM daily_counts WHERE day >= date('now','-28 days') AND page='calculator'
GROUP BY tool;
```

Sources: [D1 statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/),
[Worker logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/),
[rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/),
[UK statistical exception](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/).
