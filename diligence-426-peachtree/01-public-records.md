# 01 — Public Records (Tax, Deed, Permits, Septic, Zoning)

**Property:** 426 Peachtree Drive, Rincon, GA 31326 · Parcel **0435A084** · Effingham County
**Pulled:** 2026-06-18

> Access note: The authoritative county systems (qPublic assessor portal, building-permit
> portal) and the state deed index (GSCCCA) **block automated access** (HTTP 403 / login /
> JS-gated). Items below that could not be machine-pulled are marked **UNAVAILABLE** with a
> ready-to-send request or call script in **07-human-actions.md**. Nothing here is invented.

## A0. Confirmed parcel identity — VERIFIED (qPublic pull, 2026-06-18)

| Field | Value |
|---|---|
| Owner of record | **SHIELDS, EDISON AND JENNIFER** |
| MBL | **435A-84** (= Parcel 0435A084) ✓ |
| Zoning | **R-1 (single-family residential)** — see §E |
| Deed | **Book 2808, Page 544** |
| Plat | **B104 E** |
| Water (county field) | **"UNKNOWN"** — county left blank; does not contradict the regulated community-water finding in `03-water-system.md` |
| Building Type code | 16125 (assessor code; meaning not decoded) |
| Year built / Lot area / Occupancy | blank on the pulled record |

## A. Assessment & taxes

| Item | Status | Value / Note |
|---|---|---|
| Assessed value (40% of FMV) | **UNAVAILABLE** | qPublic blocked (403). Pull parcel 0435A084 record / use qPublic tax estimator. |
| Fair market value (assessor) | **UNAVAILABLE** | Same. |
| 2025 millage (unincorporated) | **ESTIMATED** | ~**24 mills** total: county ~5.596 + school ~18.45 (Trisha Cook coastal-GA tax guide, secondary). County 2025 millage staff report saved but the PT35 rate table is image-only — numbers not machine-readable. |
| Effective tax rate | **ESTIMATED** | ~0.96% of FMV (24 mills × 40%). Secondary sources cite 0.94–1.03%. |
| Homestead exemption | **VERIFIED (program terms)** | Standard Effingham homestead: **$4,000 off county** assessed + **$2,000 off school** assessed for owner-occupants. Buyer is owner-occupant → eligible (must file by Apr 1). |
| Est. annual tax @ $459,900 w/ homestead | **ESTIMATED** | **~$4,364/yr (~$364/mo)** — math in `financial_model.py` (`annual_property_tax`). Treat as planning figure until the real bill/assessed value is pulled. |
| Neighborhood data point | secondary | NeighborWho lists avg property tax on Peachtree Dr ≈ **$2.6k/yr** (likely reflects lower assessed values / older basis than a $459,900 purchase; a post-sale reassessment typically raises it). |

Sources: `https://qpublic.schneidercorp.com/Application.aspx?App=EffinghamCountyGA` (blocked),
`https://trishacook.com/blog/understanding-property-taxes-in-coastal-georgia`,
`sources/effingham-2025-millage-staff-report.pdf`,
`https://dor.georgia.gov/local-government-services/digest-compliance/property-tax-millage-rates`.

> **Note on reassessment:** GA reassesses near sale price. Budget property tax off the
> **purchase price** (model does this), not the seller's current (lower) assessed value.

## B. Deed & sale history — **PARTIAL** (refs VERIFIED; documents still to pull)

- **Vesting deed: Book 2808, Page 544** · **Plat: B104 E** · Owners **Edison & Jennifer
  Shields** (VERIFIED via qPublic). Use these to pull the actual instruments on GSCCCA.
- Still **UNAVAILABLE** (need the documents themselves): prior sale price/date, open
  liens/security deeds/UCC, and any recorded **water-service covenant / shared-well or
  utility easement** and **HOA covenants (CC&Rs)** for Southern Hills Plantation. **GSCCCA**
  real-estate index (free login): `https://search.gsccca.org` — pull Deed Book 2808/544 and
  Plat B104 E. See 07.

## C. Permits — **UNAVAILABLE** (Tier-1 red flags #1 & #5)

| Question | Status | Where |
|---|---|---|
| Is the **24×30 detached garage → apartment** conversion permitted (building, electrical, plumbing for kitchenette + full bath)? | **UNAVAILABLE** | Effingham County Building & Code Enforcement permit history for 0435A084. |
| Was the structure permitted as a garage only, or as a dwelling/accessory unit? | **UNAVAILABLE** | Same. |
| **Roof** — any reroof permit (age clue)? | **UNAVAILABLE** | Same + assessor "year built / effective year" + a roofer's certification. House built **2002**; if original architectural shingles, roof is **~24 yrs old → likely at/over end of life** (VA appraiser may require a roof cert / remaining-life statement). |

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
Action: open-records request to Effingham County Environmental Health (07).

## E. Zoning & home-occupation — **PARTIAL** (Tier-1 red flag #5)

| Question | Status | Where / finding |
|---|---|---|
| Zoning class of 0435A084 | **VERIFIED** | **R-1 (single-family residential)** per qPublic. |
| Are **accessory dwelling units / second kitchens** allowed; can the apartment be rented? | **LEANS NO — confirm with P&Z** | Effingham allows up to 2 units/lot incl. one ADU **but that provision carries a 5-acre minimum** (rural/AR table: 50-ft setbacks, 5 ac). Subject lot is **0.48 ac in R-1**, so it almost certainly does not qualify. County defines single-family as **"a single set of kitchen facilities"** — a detached unit with its own kitchen reads as a 2nd dwelling unit. Get the R-1-specific ADU rule from P&Z. |
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
