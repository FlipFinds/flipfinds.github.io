# Dashboard integration — launch preparation

Prepared locally on `codex/dashboard-site-launch`. No publish, merge, DNS change or production service change is authorized.

Keep `data/acquisition.json` → `webSignupEnabled: false`. The future receiver is `https://app.flipfinds.net/start`; it has not been deployed or configured in DNS. Workspace entry links reuse one guarded template across header, home/store buttons and content CTAs. Existing app-store routes, calculators, analytics consent and canonical pages remain in place.

For local review with the dashboard preview running on port 3210:

```text
hugo server --bind 127.0.0.1 --port 1317 --environment development --config hugo.toml,config/dashboard-preview.toml --disableFastRender
```

Open `http://127.0.0.1:1317/` and choose **Start on web**. The preview link requires both development mode and the explicit local config. The normal production build ignores this preview configuration. The template only permits the proposed HTTPS launch URL or the exact local preview URL.

Existing consented first/current campaign handoff works for the HTTPS launch URL. The HTTP local preview carries no acquisition history. Receiver-side consent, attribution persistence and confirmed purchase reporting remain launch blockers; a CTA click is not a completed signup or payment.

Before enabling the flag: verify dashboard hosting, approved auth domain, new-user and existing-mobile-account flows, cache/account isolation, plan access, analytics consent and Stripe/RevenueCat reconciliation. Release the website flag only after the receiving product is validated and launch is explicitly approved.
