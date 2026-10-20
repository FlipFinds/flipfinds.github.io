+++
title = "How to Reconcile Reseller Inventory: A Worked Example"
description = "Work through a five-item thrift haul: split the purchase cost, match physical stock to records, check selling expenses and separate profit from unsold inventory."
intent = "inventory_reconciliation"
date = 2026-10-03T00:00:00Z
lastmod = 2026-10-19T00:00:00Z
related = ["guides","product/inventory-tracker","resources/fee-assumptions"]
+++

Inventory reconciliation asks whether your records describe the items you own and the sales that actually happened. It is a practical check before analytics, a sourcing trip or a change of devices.

## Start with a defined batch

Choose a bin, category or short period you can verify. Match each item with its record using an identifier and distinguishing details. Do not delete possible duplicates until you have checked whether they represent different physical items.

Confirm current status. An item sold elsewhere should not still appear available. A listing-ready item and one waiting for testing should not be treated as the same queue.

## Check cost evidence

Use receipts, purchase notes or another defensible source. When buying a lot, allocate the total consistently and avoid assigning the full cost to every item. An unknown amount is not a zero-cost purchase.

If the original cost cannot be recovered, keep the record's limitation visible in your review. Do not infer a precise profit trend from missing expenses.

## Check completed transactions separately

Match actual proceeds, seller fees, labels and discounts with the sold item. Keep expected selling prices out of realized-revenue totals. Correct a missing shipping label before drawing conclusions about margin.

For a hypothetical $12 item listed at $45 but still unsold, you have an inventory purchase and an asking price. You do not yet have $33 of realized profit.

## Worked example: reconcile a five-item thrift haul

Suppose you buy five items together for **$30**, with no item prices on the receipt. This hypothetical example uses an equal **$6 purchase cost per item** as its recorded allocation. It illustrates how to keep the records consistent; it is not a claim about the items' market values.

### 1. Assign the purchase cost once

Give each item a unique ID and keep the receipt with a note explaining the split: $30 ÷ 5 = $6 each. Check that all five item costs add back to $30. Entering the full $30 against every item would incorrectly record $150 of purchases.

If your receipt supplies individual prices, use those documented amounts instead. For a bundle with materially different items, record the basis for the allocation you choose rather than silently changing costs to make an item's profit look better. In every case, the item allocations must reconcile to the amount paid.

### 2. Match all five records to an outcome

After two sales, compare the records with your physical stock and transaction statements. These are illustrative entries, not actual customer results:

| Item ID | Item | Purchase cost | Current status | What confirms it |
|---|---|---|---|---|
| HAUL-01 | Denim jacket | $6 | Sold | Completed transaction; no longer in stock |
| HAUL-02 | Board game | $6 | Sold | Completed transaction; no longer in stock |
| HAUL-03 | Serving bowl | $6 | Listed | Found in bin A; listing still active |
| HAUL-04 | Book set | $6 | Listed | Found on shelf B; listing still active |
| HAUL-05 | Canvas bag | $6 | Unlisted | Found in bin A; awaiting listing |
| **Total** | **5 items** | **$30** | **2 sold, 3 still owned** | **Every record accounted for** |

The three unsold items carry **$18 of allocated purchase cost**. Their asking prices do not enter completed-sale revenue. If HAUL-04 cannot be found, put it on your investigation list; a missing physical item is not evidence of a sale.

### 3. Check each completed sale's expenses

Both example sales have **$0 shipping collected from the buyer** and **$0 other costs**, explicitly checked. Seller fees below are hypothetical amounts from the example statements, not marketplace fee presets.

| Completed-sale entry | Denim jacket | Board game | Total |
|---|---|---|---|
| Actual sale price | $30 | $20 | $50 |
| Shipping collected | $0 | $0 | $0 |
| Allocated purchase cost | $6 | $6 | $12 |
| Seller fees | $3 | $2 | $5 |
| Shipping label paid | $5 | $4 | $9 |
| Packaging | $0.50 | $0.50 | $1 |
| Other costs | $0 | $0 | $0 |
| **Profit after these costs** | **$15.50** | **$7.50** | **$23** |

For the jacket: $30 − $6 − $3 − $5 − $0.50 = **$15.50**. The same calculation gives **$7.50** for the game. Together, $50 of completed-sale revenue minus $27 of allocated purchase and selling costs leaves **$23**.

If the game's $4 label is missing from your records, the apparent total would be $27 instead of $23. Leave that expense unresolved until you check it; a blank field does not confirm a free label. Correct it before treating the completed-sale result as reconciled.

### 4. Separate sold-item profit from the whole haul's cash

The **$23 sold-item profit** deducts the $12 purchase cost allocated to the two sold items. But you paid **$30 for the whole haul**. Including that full purchase outlay, the example's cash remaining is:

**$50 received − $30 haul purchase − $5 fees − $9 labels − $1 packaging = $5.**

The $18 difference remains in the purchase cost of the three unsold items. This cash comparison covers only the stated batch and expenses; it is not a complete business cash-flow statement. It explains why completed sales can show profit while much of your original cash remains tied up in stock.

### 5. Save the reconciled result and follow-up list

Your finished batch check should show:

- **Count:** 5 purchased = 2 sold + 3 physically located unsold items.
- **Purchase allocation:** $12 assigned to sold items + $18 assigned to unsold items = the $30 receipt.
- **Completed sales:** $50 revenue, $27 included costs and $23 profit after those costs.
- **Evidence:** receipt, allocation note, transaction records and checked label expenses.
- **Next actions:** list the canvas bag and investigate any missing item or undocumented expense before relying on its result.

Use the [free Excel inventory template](/resources/inventory-template/) to repeat the check with your own records. Enter the allocated purchase cost in each row; only mark an item Sold when the sale has happened. The workbook calculates actual profit only for Sold rows with all required numeric cost and revenue fields completed. Keep your allocation note and source evidence alongside the workbook. It does not automatically import into FlipFinds.

## Leave an auditable next step

Record which items still need evidence, status updates or a physical search. Fix a manageable batch and repeat using the same definitions.

Local inventory can be reviewed without a Cloud account. If using connected Cloud, check synchronization and separate photo-backup status; a partial or offline state can limit what another device shows.

[Explore the inventory workflow](/product/inventory-tracker/) and use the [methodology](/resources/fee-assumptions/) to keep estimates distinct from recorded outcomes.

{{< app_cta source="inventory_reconciliation" >}}
