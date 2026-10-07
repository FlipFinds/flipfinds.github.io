# Homepage editorial pass — 2026-10-07

The marketing homepage repeated the same add/organize/review story in the hero, value strip, desktop section and workflow. This pass preserves the hero/product visuals and gives the remaining sections distinct purposes.

- Removed the redundant three-part value strip.
- Reframed the preview desktop section around desktop access, reports and the same mobile Cloud account. Open dashboard provides a direct next step; header and hero retain purchase options.
- Shortened the workflow into three practical steps.
- Replaced the tall learning section with three compact full-card links: first-item setup, guides and common questions.
- Moved detailed FAQs to /pages/faq/, with topic navigation and links from Home, footer and Contact.
- Added preview FAQs covering web purchase, mobile Pro access, subscription management and retained Cloud inventory. Existing workspace-link gating keeps web purchase/dashboard links out of the production build until launch is enabled.

Validation: production Hugo build and site validator passed; all 13 existing website tests passed. Preview Home and FAQ checked at 1440, 768, 390 and 320 widths without horizontal overflow; topic navigation and web FAQ visibility verified. Desktop screenshots inspected. No new app behavior, payment behavior, analytics events or schema changes.

Restore point: codex/backup-before-homepage-editorial-20261007 (b28c143). No deployment.
