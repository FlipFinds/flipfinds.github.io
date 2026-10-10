# Download page design pass

Prepared locally on codex/download-page-design. The dedicated Hugo download layout replaces the article presentation at /download/ while retaining its title, metadata, canonical URL, shared header/footer, store URLs and download_page attribution.

Design decisions:
- Give app downloads first attention with platform badges in the hero and a clear local-inventory/no-account reassurance.
- Use a two-screen product composition made from existing real Inventory and Item Detail screenshots. Example data disclosure stays visible; no fabricated ratings, testimonials or performance claims.
- Present three concrete benefits, followed by a short first-item walkthrough and collapsible answers.
- Move the Pro offer below installation guidance; preserve launch gating for web/dashboard content.
- Keep native links and details controls accessible without added JavaScript. Existing store routing and consent-controlled click tracking remain in place.

Sources consulted:
- https://www.nngroup.com/articles/homepage-design-principles/ (clear purpose and action)
- https://developer.apple.com/app-store/marketing/guidelines/ (official badge artwork)

Validation: fresh production Hugo build and built-site validator (zero errors, explicit image dimensions); existing 13 tests; browser review at 1440, 390 and 320 pixels, including no horizontal overflow, single H1, FAQ interaction and real-screen imagery. Store links and narrow-screen badge visibility checked separately.

Measurement: existing consented store-click events can measure engagement. This pass does not add install or first-item attribution; any improvement in install conversion must be measured after launch rather than assumed from design.

Backup: codex/backup-before-download-design-20261007, commit 20bb3b9. Tracked website source ZIP: C:/Users/Richard Coding/.codex/backups/flipfinds-download-design-20261007/website-source.zip. Preserve newer work before selectively restoring or reviewing the backup branch in a separate worktree. No production deployment.
