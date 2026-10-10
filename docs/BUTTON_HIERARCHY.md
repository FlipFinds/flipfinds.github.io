# Website button hierarchy refinement

Prepared locally on codex/website-button-hierarchy. No deployment or purchase-flow changes.

- Keep brand forest green for primary Pro purchase buttons.
- Header app download uses a quieter outlined button, with stable dimensions on hover/focus.
- Home/product/closing Pro actions sit outside store badge groups, with a short mobile-and-dashboard explanation.
- Download page separates its optional Pro offer into a responsive card below device download instructions.
- Screenshot tabs use a pale green selection with a border rather than the same solid treatment as purchase actions.
- Existing CTA URLs, attribution placements, store badge artwork and launch gating remain intact. Production build still hides dashboard purchase links while web signup is disabled.

Restore source from backup branch codex/backup-before-button-hierarchy-20261007 (commit 6c5ab9b), or ZIP at C:/Users/Richard Coding/.codex/backups/flipfinds-button-hierarchy-20261007/website-source.zip. Review any newer edits before restoring.

Validation: development and production Hugo builds; all 13 existing unit checks; built-site validator reports zero errors and no image-dimension warnings; browser inspection of Home, Download and Pricing at 1440, 390 and 320 pixels with no horizontal overflow. Primary/secondary hierarchy, stable hover geometry, preview selection and separated download/purchase links verified. No runtime functionality or pricing changes.
