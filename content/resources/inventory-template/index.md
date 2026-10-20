+++
title = "Free Reseller Inventory Spreadsheet for Excel"
description = "Download a free Excel inventory template with item status, costs, actual profit and ROI. No signup required; unsold estimates stay out of realized profit."
intent = "inventory_template"
lastmod = 2026-10-19T00:00:00Z
hideMeta = true
related = ["resources", "product/inventory-tracker", "calculator/reseller-roi", "guides/inventory-reconciliation"]
+++

Keep one row per item and calculate the outcome only when the item sells. This free template has 100 prepared rows with formulas and a status dropdown. It works without an email address or a FlipFinds account.

{{< resource-download file="/downloads/flipfinds-inventory-template.xlsx" name="inventory_template" label="Download the free Excel inventory template" >}}

## Fill in a record

1. Enter a stable item ID, recognizable title and Unlisted, Listed or Sold status.
2. Record purchase cost, shipping paid, supplies and other costs.
3. For a completed sale, enter actual sale price, shipping collected from the buyer and seller fees. Enter explicit zeros when a charge does not apply. Leave an unknown amount blank.
4. Review calculated revenue, cash invested, actual profit and ROI in the green columns.

Only Sold rows with all seven numeric cost/revenue fields completed show actual profit. An asking price on an unsold item does not become realized revenue. Zero cash investment leaves ROI blank; losses remain negative. Seller fees are deducted from proceeds rather than included in the investment denominator, matching the [public calculator methodology](/resources/fee-assumptions/).

## Check the first sale

For a hypothetical $40 sale, $10 purchase cost, $5 shipping, $0.75 supplies, no other cost, no shipping collected and $4 seller fees, the template shows $20.25 profit and about 128.6% ROI. Enter actual expenses for your own transaction; no marketplace rate is built into this template.

## Preview a completed spreadsheet row

This readable preview uses the download's actual column names, grouped here to fit the page. The workbook itself has one row per item and 14 columns. The download starts with blank input rows; the sample below is hypothetical data you can enter to check the formulas.

| Item ID | Item / model | Status |
|---|---|---|
| EXAMPLE-01 | Sample resale item | Sold |

| Purchase cost | Shipping paid | Supplies | Other costs |
|---|---|---|---|
| $10.00 | $5.00 | $0.75 | $0.00 |

| Sale price | Buyer shipping | Seller fees |
|---|---|---|
| $40.00 | $0.00 | $4.00 |

| Revenue | Cash invested | Actual profit | ROI |
|---|---|---|---|
| $40.00 | $15.75 | $20.25 | 128.6% |

The first ten columns are entries; the final four calculate results. Revenue is sale price plus buyer shipping. Cash invested adds purchase cost, shipping paid, supplies and other costs. Actual profit subtracts cash invested and seller fees from revenue; ROI divides that profit by cash invested.

Change Status to **Listed** and revenue, actual profit and ROI stay blank; completed cash-investment inputs can still show the money tied up in the item. Return it to Sold and clear Shipping paid: profit stays blank until all required inputs are known. Enter zero only when the expense is confirmed not to apply.

## Keep your records complete

Use one currency consistently. Keep identifiers unique, and sort complete rows so inputs stay with their results. To add more than 100 items, copy a complete prepared row, including formulas, before entering the next item. Preserve your own backup.

Your entries remain in the downloaded workbook. FlipFinds does not receive them or automatically import this file. If you want item tracking in the app, [start with one item](/pages/start-here/) and enter its details manually.

{{< app_cta source="inventory_template" >}}
