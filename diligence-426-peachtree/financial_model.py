#!/usr/bin/env python3
"""
426 Peachtree Drive, Rincon, GA 31326 -- VA single-income acquisition model.

ALL ASSUMPTIONS ARE EDITABLE AT THE TOP. Run:  python3 financial_model.py
Every figure printed is computed here (no hand-entered results).

Labeling convention used in the written report:
  VERIFIED  = pulled from an authoritative source (see 01-03 / sources/)
  ESTIMATED = calculated here; math is in this file
  UNAVAILABLE = needs human action (see 07-human-actions.md)
"""

# ----------------------------------------------------------------------------
# EDITABLE ASSUMPTIONS
# ----------------------------------------------------------------------------
PRICES        = [459_900, 440_000, 435_000]      # list / offer scenarios
DOWN_PAYMENTS = [0, 25_000, 30_000]              # cash down scenarios
RATES         = [5.75, 6.00, 6.25, 6.50]         # annual % (VA 30yr fixed)
TERM_YEARS    = 30

# VA funding fee: task fixes this at 2.15% financed (first use, <5% down, 0% disability).
# NOTE: with >=5% down the statutory fee DROPS to 1.50% (see report flag). Editable:
FUNDING_FEE_RATE = 0.0215
FINANCE_FUNDING_FEE = True                       # rolled into loan (not paid cash)

# Property tax (GA): assessed = 40% of fair market value, then x millage.
ASSESSMENT_RATIO = 0.40
MILLAGE          = 0.029526  # VERIFIED 2026 total, Tax District 01-County (qPublic, parcel 0435A084)
HOMESTEAD_COMBINED = 6_000   # ~$4k county + $2k school off assessed (owner-occupied); ESTIMATED credit
USE_PRICE_AS_FMV = True      # buyer's FMV resets toward purchase price after sale
TAX_OVERRIDE_ANNUAL = None   # set to a $ number to force a known tax bill
ASSESSOR_FMV_2026 = 413_078  # VERIFIED reference (current assessor value, pre-sale)

# Insurance (annual $). Range 2,500-3,500; mid used for run-rate.
INSURANCE_LOW, INSURANCE_MID, INSURANCE_HIGH = 2_500, 3_000, 3_500

# Maintenance reserve (% of value / yr). 1.25-1.5%.
MAINT_PCT_LOW, MAINT_PCT_HIGH = 0.0125, 0.0150

# Monthly utilities (net of paid-off solar)
UTIL_ELECTRIC = 75   # net of solar
UTIL_PROPANE  = 30   # private LP
UTIL_WATER    = 40   # community water system (Coastal Water Co) -- VERIFY actual bill
UTIL_SEPTIC   = 15   # pump-out reserve
UTIL_TRASH    = 30
UTIL_INTERNET = 90
HOA_MONTHLY   = 0    # UNKNOWN -- Southern Hills HOA dues not confirmed; verify

# Buyer
NET_TAKEHOME_MONTHLY = 7_370
APPRECIATION_ANNUAL  = 0.04   # for equity-breakeven

# ----------------------------------------------------------------------------
# ENGINE
# ----------------------------------------------------------------------------
def monthly_pi(loan, annual_rate_pct, term_years=TERM_YEARS):
    r = annual_rate_pct / 100 / 12
    n = term_years * 12
    if r == 0:
        return loan / n
    return loan * r * (1 + r) ** n / ((1 + r) ** n - 1)

def loan_amount(price, down):
    base = price - down
    fee = base * FUNDING_FEE_RATE if FINANCE_FUNDING_FEE else 0.0
    return base + fee, base, fee

def annual_property_tax(fmv):
    if TAX_OVERRIDE_ANNUAL is not None:
        return TAX_OVERRIDE_ANNUAL
    assessed = fmv * ASSESSMENT_RATIO
    taxable = max(0, assessed - HOMESTEAD_COMBINED)   # owner-occupied
    return taxable * MILLAGE

def remaining_balance(loan, annual_rate_pct, months_elapsed, term_years=TERM_YEARS):
    r = annual_rate_pct / 100 / 12
    n = term_years * 12
    p = monthly_pi(loan, annual_rate_pct, term_years)
    if r == 0:
        return max(0, loan - p * months_elapsed)
    bal = loan * (1 + r) ** months_elapsed - p * (((1 + r) ** months_elapsed - 1) / r)
    return max(0, bal)

def months_to_positive_equity(start_value, loan, annual_rate_pct):
    """First month where appreciated value >= remaining loan balance.
       start_value = the TRUE market value at closing (= price if you pay market;
       < price if there is an appraisal gap)."""
    for m in range(0, 360 + 1):
        value = start_value * (1 + APPRECIATION_ANNUAL) ** (m / 12)
        bal = remaining_balance(loan, annual_rate_pct, m)
        if value >= bal:
            return m
    return None  # never within term

# Appraisal-gap scenario: assumed TRUE market values to test against the purchase.
APPRAISAL_VALUES = [430_000, 440_000, 450_000, 459_900]

def cash_to_close(price, down):
    """Rough estimate. VA caps buyer non-allowables; closing costs ~2-4% of price.
       Funding fee financed (not cash). Down is cash. Add est. closing 3% + prepaids."""
    closing = price * 0.03
    prepaids = annual_property_tax(price) * 0.5 + INSURANCE_MID  # ~6mo tax escrow + 1yr ins
    return down + closing + prepaids, closing, prepaids

def run_rate(price, down, rate):
    loan, base, fee = loan_amount(price, down)
    pi = monthly_pi(loan, rate)
    tax_m = annual_property_tax(price) / 12
    ins_m = INSURANCE_MID / 12
    piti = pi + tax_m + ins_m
    maint_m = (price * (MAINT_PCT_LOW + MAINT_PCT_HIGH) / 2) / 12
    util = (UTIL_ELECTRIC + UTIL_PROPANE + UTIL_WATER + UTIL_SEPTIC
            + UTIL_TRASH + UTIL_INTERNET + HOA_MONTHLY)
    allin = piti + maint_m + util
    left = NET_TAKEHOME_MONTHLY - allin
    pct = allin / NET_TAKEHOME_MONTHLY * 100
    eq_m = months_to_positive_equity(price, loan, rate)  # assumes you pay market value
    return dict(price=price, down=down, rate=rate, loan=loan, base=base, fee=fee,
                pi=pi, tax_m=tax_m, ins_m=ins_m, piti=piti, maint_m=maint_m,
                util=util, allin=allin, left=left, pct=pct, eq_m=eq_m)

def money(x): return f"${x:,.0f}"

# ----------------------------------------------------------------------------
# REPORT
# ----------------------------------------------------------------------------
def main():
    print("=" * 78)
    print("426 PEACHTREE DRIVE, RINCON GA 31326 -- VA ACQUISITION MODEL (ESTIMATED)")
    print("=" * 78)
    print(f"Net take-home: {money(NET_TAKEHOME_MONTHLY)}/mo | Funding fee: {FUNDING_FEE_RATE*100:.2f}% financed"
          f" | Millage: {MILLAGE*1000:.2f} mills | Appreciation: {APPRECIATION_ANNUAL*100:.0f}%/yr")
    t = annual_property_tax(PRICES[0])
    print(f"Est. annual property tax @ {money(PRICES[0])} (w/ homestead): {money(t)}  "
          f"(=40% x price x 29.526 mills, less homestead)")
    print()

    # ---- Base case detail
    bc = run_rate(459_900, 0, 6.00)
    print("-" * 78)
    print("BASE CASE: price $459,900 | $0 down | 6.00% | 30yr")
    print("-" * 78)
    print(f"  Base loan (price - down)            {money(bc['base'])}")
    print(f"  + VA funding fee 2.15% (financed)   {money(bc['fee'])}")
    print(f"  = Total loan amount                 {money(bc['loan'])}")
    print(f"  Monthly P&I                         {money(bc['pi'])}")
    print(f"  + Property tax (est)                {money(bc['tax_m'])}")
    print(f"  + Insurance (mid $3,000/yr)         {money(bc['ins_m'])}")
    print(f"  = PITI                              {money(bc['piti'])}")
    print(f"  + Maintenance reserve (~1.375%/yr)  {money(bc['maint_m'])}")
    print(f"  + Utilities (elec/LP/water/septic/trash/net) {money(bc['util'])}")
    print(f"  = ALL-IN MONTHLY RUN RATE           {money(bc['allin'])}")
    print(f"  % of net take-home                  {bc['pct']:.1f}%")
    print(f"  $ left after housing                {money(bc['left'])}")
    eqm = bc['eq_m']
    print(f"  Months to positive equity (4% appr) {eqm}  (~{eqm/12:.1f} yrs)" if eqm else "  Equity never positive in term")
    c2c, closing, prepaids = cash_to_close(459_900, 0)
    print(f"  Est. cash to close ($0 down)        {money(c2c)}  "
          f"(~3% closing {money(closing)} + prepaids {money(prepaids)}; funding fee financed)")
    print()

    # ---- Grid: price x rate at $0 down
    print("-" * 78)
    print("GRID A -- $0 DOWN: ALL-IN monthly run rate (and % of net)")
    print("-" * 78)
    header = "price \\ rate   " + "".join(f"{r:>13.2f}%" for r in RATES)
    print(header)
    for price in PRICES:
        row = f"{money(price):>12}  "
        for rate in RATES:
            rr = run_rate(price, 0, rate)
            row += f"  {money(rr['allin'])}/{rr['pct']:.0f}%"
        print(row)
    print()
    print("   PITI-only (no maint/utilities), $0 down:")
    print(header)
    for price in PRICES:
        row = f"{money(price):>12}  "
        for rate in RATES:
            rr = run_rate(price, 0, rate)
            row += f"     {money(rr['piti'])}    "
        print(row)
    print()

    # ---- Down payment scenarios at 6.25%
    print("-" * 78)
    print("GRID B -- DOWN PAYMENT scenarios @ 6.25%, price $459,900")
    print("-" * 78)
    print(f"{'down':>8} {'loan':>12} {'P&I':>10} {'PITI':>10} {'all-in':>10} {'%net':>6} {'left':>10} {'eq.mos':>7}")
    for d in DOWN_PAYMENTS:
        rr = run_rate(459_900, d, 6.25)
        print(f"{money(d):>8} {money(rr['loan']):>12} {money(rr['pi']):>10} "
              f"{money(rr['piti']):>10} {money(rr['allin']):>10} {rr['pct']:>5.0f}% "
              f"{money(rr['left']):>10} {str(rr['eq_m']):>7}")
    print()

    # ---- Full scenario table (recommended offers)
    print("-" * 78)
    print("GRID C -- RECOMMENDED OFFER POINTS ($0 down): all-in & equity breakeven")
    print("-" * 78)
    print(f"{'price':>10} {'rate':>6} {'loan':>12} {'all-in':>10} {'%net':>6} {'left':>9} {'eq.mos':>7} {'eq.yrs':>7}")
    for price in PRICES:
        for rate in [5.75, 6.25]:
            rr = run_rate(price, 0, rate)
            eqy = f"{rr['eq_m']/12:.1f}" if rr['eq_m'] else "n/a"
            print(f"{money(price):>10} {rate:>5.2f}% {money(rr['loan']):>12} "
                  f"{money(rr['allin']):>10} {rr['pct']:>5.0f}% {money(rr['left']):>9} "
                  f"{str(rr['eq_m']):>7} {eqy:>7}")
    print()
    print("-" * 78)
    print("GRID D -- APPRAISAL-GAP equity recovery: PAY $459,900, $0 down, 6.25%")
    print("           (start underwater by gap + financed funding fee)")
    print("-" * 78)
    loan_459, _, _ = loan_amount(459_900, 0)
    print(f"   Total loan (incl. financed fee): {money(loan_459)}")
    print(f"{'true value':>12} {'gap vs price':>13} {'day-1 equity':>13} {'mos to +equity':>15} {'yrs':>6}")
    for v in APPRAISAL_VALUES:
        gap = v - 459_900
        day1 = v - loan_459
        m = months_to_positive_equity(v, loan_459, 6.25)
        yrs = f"{m/12:.1f}" if m else "n/a"
        print(f"{money(v):>12} {money(gap):>13} {money(day1):>13} {str(m):>15} {yrs:>6}")
    print()
    print("Insurance sensitivity (base case all-in delta):")
    for label, ins in [("low $2,500", INSURANCE_LOW), ("mid $3,000", INSURANCE_MID), ("high $3,500", INSURANCE_HIGH)]:
        delta = (ins - INSURANCE_MID) / 12
        print(f"   {label:>12}: all-in {money(bc['allin'] + delta)}/mo")
    print("=" * 78)

if __name__ == "__main__":
    main()
