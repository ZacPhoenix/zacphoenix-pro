# 05 — Financial Model

**Subject:** 426 Peachtree Drive, Rincon, GA 31326 · VA, single income, household of 2
**Pulled / run:** 2026-06-18
**Engine:** `financial_model.py` (run `python3 financial_model.py`). All numbers below are
computed by that script — none are hand-entered. **All assumptions are editable at the top
of the file.** Raw run saved to `sources/financial-model-output-2026-06-18.txt`.

## Editable assumptions (top of `financial_model.py`)

| Assumption | Value(s) | Label |
|---|---|---|
| Price scenarios | $459,900 / $440,000 / $435,000 | given |
| Down payment | $0 / $25,000 / $30,000 | given |
| Rate (30yr VA fixed) | 5.75 / 6.00 / 6.25 / 6.50% | given |
| VA funding fee | **2.15% financed** (first use, 0% disability, <5% down) | given* |
| PMI | none (VA) | given |
| Property tax | 40% × price × **~24 mills**, less homestead ($4k county/$2k school) | ESTIMATED |
| Insurance | $2,500 / **$3,000** / $3,500 per yr (mid in run rate) | given range |
| Maintenance reserve | 1.25–1.50%/yr of value (mid ≈ $527/mo) | given range |
| Utilities (net of solar) | electric $75 + LP $30 + water $40 + septic $15 + trash $30 + internet $90 = **$280/mo** | given |
| HOA dues | **$0 (UNKNOWN — verify Southern Hills HOA)** | UNAVAILABLE |
| Net take-home | $7,370/mo | given |
| Appreciation | 4%/yr | given |

\* **Money-saving flag:** the 2.15% fee applies at **<5% down**. At **≥5% down** the VA
funding fee statutorily drops to **1.50%**. On a $25k–$30k down / ~$440k–$460k purchase the
buyer is right around the 5% line — structuring down payment to cross 5% cuts the fee by
~$2,900–$3,200. Set `FUNDING_FEE_RATE = 0.015` to model it. (0% VA disability ⇒ fee is **not**
waived; if the buyer ever receives a VA disability rating ≥10%, the fee is **fully waived** —
worth confirming status with the VA.)

## Base case — $459,900, $0 down, 6.00%

```
  Base loan (price - down)            $459,900
  + VA funding fee 2.15% (financed)   $9,888
  = Total loan amount                 $469,788
  Monthly P&I                         $2,817
  + Property tax (est)                $364
  + Insurance (mid $3,000/yr)         $250
  = PITI                              $3,430
  + Maintenance reserve (~1.375%/yr)  $527
  + Utilities                         $280
  = ALL-IN MONTHLY RUN RATE           $4,237
  % of net take-home                  57.5%
  $ left after housing                $3,133
  Months to positive equity (4% appr) 5  (if paid at market value)
  Est. cash to close ($0 down)        $18,979  (~3% closing $13,797 + prepaids $5,182)
```

## Grid A — $0 down: all-in monthly run rate (% of net)

| price \ rate | 5.75% | 6.00% | 6.25% | 6.50% |
|---|---|---|---|---|
| **$459,900** | $4,162 / 56% | $4,237 / 57% | $4,313 / 59% | $4,390 / 60% |
| **$440,000** | $4,005 / 54% | $4,077 / 55% | $4,149 / 56% | $4,223 / 57% |
| **$435,000** | $3,965 / 54% | $4,036 / 55% | $4,108 / 56% | $4,181 / 57% |

PITI-only (no maint/utilities), $0 down: $3,355→$3,583 (@ $459,900); $3,187→$3,402 (@ $435,000).

## Grid B — down-payment scenarios @ 6.25%, $459,900

| down | loan | P&I | PITI | all-in | %net | left | mos→+equity* |
|---|---|---|---|---|---|---|---|
| $0 | $469,788 | $2,893 | $3,506 | $4,313 | 59% | $3,057 | 6 |
| $25,000 | $444,250 | $2,735 | $3,349 | $4,156 | 56% | $3,214 | 0 |
| $30,000 | $439,143 | $2,704 | $3,318 | $4,125 | 56% | $3,245 | 0 |

\* assumes purchase = market value.

## Grid C — recommended offer points ($0 down): equity breakeven (paid at market)

| price | rate | loan | all-in | %net | left | mos→+equity | yrs |
|---|---|---|---|---|---|---|---|
| $459,900 | 5.75% | $469,788 | $4,162 | 56% | $3,208 | 5 | 0.4 |
| $459,900 | 6.25% | $469,788 | $4,313 | 59% | $3,057 | 6 | 0.5 |
| $440,000 | 5.75% | $449,460 | $4,005 | 54% | $3,365 | 5 | 0.4 |
| $440,000 | 6.25% | $449,460 | $4,149 | 56% | $3,221 | 6 | 0.5 |
| $435,000 | 5.75% | $444,352 | $3,965 | 54% | $3,405 | 5 | 0.4 |
| $435,000 | 6.25% | $444,352 | $4,108 | 56% | $3,262 | 6 | 0.5 |

## Grid D — APPRAISAL-GAP equity recovery (the real negative-equity risk)

Pay **$459,900, $0 down, 6.25%** → total loan **$469,788**. If the home's *true* market value
is below list, the buyer starts underwater by the gap **plus** the financed funding fee:

| true value | gap vs price | day-1 equity | months → +equity | yrs |
|---|---|---|---|---|
| $430,000 | −$29,900 | **−$39,788** | 21 | 1.8 |
| $440,000 | −$19,900 | **−$29,788** | 16 | 1.3 |
| $450,000 | −$9,900 | **−$19,788** | 11 | 0.9 |
| $459,900 | $0 | −$9,888 | 6 | 0.5 |

**Read:** Even if value = price, the financed 2.15% fee means ~$9.9k negative equity day one,
recovered in ~6 months at 4% appreciation. But at a plausible appraised value of ~$430k, the
buyer is ~$40k underwater and needs **~1.8 years** of 4% appreciation just to break even —
and would owe gap cash at closing if VA's Notice of Value comes in low. This is the core
financial argument for **offering $435k–$440k** rather than list.

## Insurance sensitivity (base case all-in)
low $2,500 → $4,196/mo · mid $3,000 → $4,237/mo · high $3,500 → $4,279/mo.

## Affordability read (single income)
- All-in housing runs **54–60% of net take-home** across scenarios. That is **high** for a
  single income with a non-earning partner — conventional comfort is ≤35–40% of gross / ~45%
  of net. ~$3,000–$3,400/mo remains for **all other living costs** (food, transport, health,
  insurance, debt, savings) for a household of 2.
- Drivers that improve it: lower price ($435–440k), buying down the rate, ≥5% down (also cuts
  the funding fee to 1.5%), confirming the **$40/mo water** and **$0 HOA** assumptions, and
  the **solar** genuinely holding electric to ~$75/mo.
- Drivers that worsen it: HOA dues (unknown), insurance at the high end (coastal-adjacent),
  septic/roof capital events, and any appraisal-gap cash.

> Reminder: property tax here is **ESTIMATED** (40% × price × ~24 mills). Replace
> `MILLAGE`/`TAX_OVERRIDE_ANNUAL` with the VERIFIED figure once the assessor record / tax
> bill is pulled (01 / 07).
