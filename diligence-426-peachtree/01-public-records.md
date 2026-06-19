# 01 — Public Records (Tax, Deed, Permits, Septic, Zoning)

**Property:** 426 Peachtree Drive, Rincon, GA 31326 · Parcel **0435A084** · Effingham County
**Pulled:** 2026-06-18 · **Updated 2026-06-19 with the full qPublic property record (buyer-supplied PDF).**

> Access note: Most of this section is now **VERIFIED** from the official qPublic property
> record card for parcel 0435A084 (saved to `sources/`). Items still requiring the underlying
> documents (deed instruments, permit file, septic file) remain **UNAVAILABLE** with a
> ready-to-send request in **07-human-actions.md**. Nothing here is invented.

## A0. Parcel identity & assessment — VERIFIED (qPublic record, last data upload 2026-06-18)

| Field | Value |
|---|---|
| Owner of record | **SHIELDS, EDISON AND JENNIFER** (no homestead currently) |
| Parcel / Account (Realkey) | **0435A084 / 16125** |
| Legal | **.48 AC LOT 84**, Neighborhood 0435A (Southern Hills) |
| Tax class | **R3-Residential** (tax only) · **Zoning R-1** (see §E) |
| Tax District | **01-County (District 01)** |
| **Millage Rate** | **29.526 mills** (VERIFIED total for this parcel — replaces earlier ~24 estimate) |
| Acres | 0.48 |
| Deed / Plat | **Book 2808, Page 544** / Plat **B104 E** |
| Water (county field) | **"UNKNOWN"** — left blank; does not contradict community-water finding (`03`) |
| Style / Heated SqFt | One Family / **2,194 SF** (main house only) |
| Year Built | **2001** (listing said 2002) |
| Construction | Brick veneer · **Slab perimeter** · Sheetrock · Cent Heat/AC |
| Roof | **Fiberglass (asphalt) — original 2001** → see roof note in §C |
| Baths / Plumbing | **3 full baths**, **9 "plumbing extras"** (high — consistent with extra kitchen/bath fixtures) |
| Bedrooms (assessor) | 0 (assessor often leaves blank; listing markets 4bd) |

## A. Assessment, valuation & taxes — VERIFIED

| Item | 2026 | 2025 |
|---|---|---|
| Land value | $75,000 | $75,000 |
| + Improvement value | $311,932 | $283,181 |
| + **Accessory value** | $26,146 | $26,146 |
| = **Total FMV (assessor)** | **$413,078** | $384,327 |
| Assessed (40% of FMV) | ~$165,231 | ~$153,731 |

**Accessory breakdown (VERIFIED):** Home site above average **$12,950** + **GARAGE $13,196**
= $26,146. *(The detached building is carried entirely as a **garage** — see §C/§E.)*

**Property tax (now on VERIFIED 29.526 mills):**
- **Current owner** (no homestead, FMV $413,078): assessed $165,231 × 0.029526 ≈ **$4,879/yr**.
  *(NeighborWho's ~$2.6k figure was stale/low.)*
- **Buyer go-forward** (GA resets FMV toward sale price; with owner-occupant homestead):
  - @ $459,900 → **~$5,254/yr (~$438/mo)** ESTIMATED
  - @ $440,000 → ~$5,019/yr (~$418/mo)
  - @ $435,000 → ~$4,960/yr (~$413/mo)
- Homestead (VERIFIED terms): $4,000 off county + $2,000 off school assessed; **buyer must
  file** (current owners have none). Math in `financial_model.py`.

Source: qPublic property record, parcel 0435A084 (saved `sources/qpublic-report-0435A084-2026-06-19.pdf`).

> **Note on reassessment:** GA reassesses near sale price. The model budgets tax off the
> **purchase price** (~$413–438/mo), not the seller's current lower assessed value.

## B. Deed & sale history — **PARTIAL** (sale history VERIFIED; deed instruments still to pull)

**Sale history (VERIFIED — qPublic):**

| Date | Price | Note |
|---|---|---|
| **9/2/2022** | **$427,000** | Current owners (Shields) purchased — most recent arm's-length sale |
| 1/8/2016 | $0 | Non-arm's-length transfer (quitclaim/family/refi) |
| 5/30/2002 | $190,000 | Original sale (new construction) |

> **Valuation anchor:** Owners paid **$427,000 in Sept 2022** and now list at **$459,900**
> (+$32,900 / +7.7% in ~3.5 yrs). Assessor 2026 FMV is **$413,078** — i.e., the **list is
> ~$47k above the assessor's value** and the officially-recognized improvements do **not**
> include the apartment (see §E). Reinforces the appraisal-gap analysis in `04` / `05`.

- **Vesting deed: Book 2808, Page 544** · **Plat: B104 E** (VERIFIED refs). Pull the actual
  instruments on **GSCCCA** (`https://search.gsccca.org`) for: open liens/security deeds, and
  any recorded **water-service covenant / shared-well or utility easement** and **HOA
  covenants (CC&Rs)** for Southern Hills Plantation. — documents still **UNAVAILABLE**; see 07.

## C. Permits — **UNAVAILABLE on file, but strong "garage-only" signal** (Tier-1 #1 & #5)

> **Key new evidence (VERIFIED):** The qPublic **Permits module shows "No data,"** and the
> assessor carries the detached building **purely as a GARAGE** — sketch shows **"04 Garage
> 528 SF" + "15 Add'l Garage 264 SF"** (~792 SF total) with **zero heated square feet** and an
> accessory value of only **$13,196**. The home's heated area (2,194 SF) is the **main house
> only**. In other words, **the county does not recognize the apartment as living space.**
> That is exactly what an **unpermitted garage-to-apartment conversion** looks like on the
> record. Treat the conversion as **presumed unpermitted until the building file proves
> otherwise.**

| Question | Status | Where |
|---|---|---|
| Garage→apartment conversion permitted (bldg/elec/plumbing for kitchen + full bath)? | **UNAVAILABLE — presumed NO** | Effingham Building & Code Enforcement file for 0435A084. |
| Permitted as garage only, or as dwelling/accessory unit? | **Assessor = garage only** | Confirm in permit file. |
| **Roof** — original or reroofed? | **VERIFIED original 2001** | Roof dates to **2001 build = ~25 yrs old → at/over typical asphalt-shingle life.** No reroof permit seen. Expect a VA appraiser to require a **roof certification / remaining-life statement**; budget replacement (~$12–20k) as a near-term capital item or negotiation point. |

**Online check first:** Effingham permits run through the **OpenGov portal —
`https://effinghamcountyga.portal.opengov.com/`** (search address / parcel 0435A084). Also
check the **qPublic property card** for how the detached building is classified ("GARAGE" vs
living/accessory area) and whether it shows heated/finished sqft — if it's carried as a
garage with no heated area, the county does not recognize it as living space. Building Dept:
912-754-2128, buildinginspections@effinghamcounty.org, Building Official Joshua Moody.

Action: open-records request to Effingham County Building/Permitting for the full permit
history on the parcel (07). This is the single most important paper to obtain — an
**unpermitted** conversion affects appraisal value, insurability, VA MPRs, future resale,
and the legality of any rental/in-law use.

## D. Septic (onsite sewage) — **UNAVAILABLE** (Tier-1 red flag #2)

| Question | Status | Where |
|---|---|---|
| Septic permit on file; **# bedrooms approved**? | **UNAVAILABLE** | Effingham County Environmental Health (Coastal Health District / GA DPH). |
| Is the **detached apartment legally tied to the system** (added bath/kitchen)? | **UNAVAILABLE** | Same — a 4-bd main house + apartment may exceed the permitted design flow. |
| Last pump/inspection, tank size, drainfield location | **UNAVAILABLE** | Same; request the as-built. |

Why it matters: A septic system permitted for, say, 4 bedrooms may be **overloaded** if the
apartment's kitchen/bath effectively add a 5th-bedroom-equivalent load. GA EH approval is
needed to legally connect added fixtures. VA appraisal may condition on EH sign-off.
**Corroborating detail:** the assessor lists **9 "plumbing extras"** on the main card — a high
count consistent with the apartment's added kitchen + bath fixtures, which raises the question
of whether those fixtures were ever permitted onto the septic system.
Action: open-records request to Effingham County Environmental Health (07).

## E. Zoning & home-occupation — **PARTIAL** (Tier-1 red flag #5)

| Question | Status | Where / finding |
|---|---|---|
| Zoning class of 0435A084 | **VERIFIED** | **R-1 (single-family residential)** per qPublic. |
| Are **accessory dwelling units / second kitchens** allowed; can the apartment be rented? | **LEANS NO — confirm with P&Z** | Effingham allows up to 2 units/lot incl. one ADU **but that provision carries a 5-acre minimum** (rural/AR table: 50-ft setbacks, 5 ac). Subject lot is **0.48 ac in R-1**, so it almost certainly does not qualify. County defines single-family as **"a single set of kitchen facilities"** — a detached unit with its own kitchen reads as a 2nd dwelling unit. **The assessor's own record (garage, not a dwelling — §C) is consistent with the unit never having been approved.** Get the R-1-specific ADU rule from P&Z. |
| Home-occupation rules (if buyer works from home) | **UNAVAILABLE** | County zoning ordinance, Article V/VI. |

Sources: Effingham zoning ordinance (Municode `library.municode.com/ga/effingham_county`,
Zoneomics chapter_6); ADU/2-unit amendment (Article III §5.1, 5-ac min) saved to
`sources/effingham-adu-amendment-art3-sec5.1.pdf`.

Why it matters: On a 0.48-ac R-1 lot, the detached "apartment" most likely **cannot** be a
legal separate or rentable dwelling; at best it is non-rented in-law/accessory space, and the
**second kitchen may itself be the zoning issue**. This caps any income thesis and compounds
the permit (§C) and septic (§D) questions. Confirm exact R-1 ADU rule + this structure's
status (legal nonconforming vs violation) with Planning & Zoning (07-D).

## F. Cross-references (VERIFIED elsewhere in this packet)

- **Flood zone:** Zone X, not in SFHA — see `02-flood-risk.md`.
- **Water:** State-regulated community water system (Coastal Water Co., likely PWSID
  GA1030107) — see `03-water-system.md`.
