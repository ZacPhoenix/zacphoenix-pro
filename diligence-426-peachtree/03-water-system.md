# 03 — Water System (Community Well) — VA-Relevant

**Property:** 426 Peachtree Drive, Rincon, GA 31326 · Subdivision: Southern Hills Plantation
**Pulled:** 2026-06-18

## Headline

The listing's "community well" is **not** an unregulated private/shared well. Southern Hills
Plantation is served by a **state-regulated private community water system** operated by
**Coastal Water Co.** (a Consolidated Utilities, Inc. company). For VA purposes this is a
**connection to a public/community water utility**, which is materially better than an
individual shared well — **no two-party shared-well agreement is required.** *(One caveat:
the exact PWSID is inferred — see "Confidence" below.)*

## Evidence chain

**1. Subdivision → provider (VERIFIED).**
Effingham County "Water Providers by Subdivision" list:
> SOUTHERN HILLS PLANTATION | map ref 435A | EXISTING | system at 100 Hodgeville Rd,
> "also services South Pointe" | **COASTAL WATER CO (White Bluff)**

- Source: `https://www.effinghamcounty.org/DocumentCenter/View/510/Water-Providers---by-Subdivision-PDF`
- Saved: `sources/effingham-water-providers-by-subdivision.pdf`, `sources/water-provider-finding-2026-06-18.txt`
- Parcel map prefix **435A** matches Parcel ID **0435A084** ✓

**2. Operator (VERIFIED).**
Consolidated Utilities, Inc. operates Coastal Water & Sewage Co. LLC, **Coastal Water
Company**, and several Effingham subdivision systems (incl. Westwood Heights). A 2024 EPD
notice referenced a groundwater-withdrawal permit for "Coastal Water Company – Westwood
Heights."
- `https://consolidatedutilities.com/`
- Customer policies noted on site: bills due 1st, late fee on 6th; $50 reconnect fee;
  meter-tamper fees $50–$150. (Rate schedule on their "Rates" page — pull exact tariff; see 07.)

**3. Matching regulated system in EPA SDWIS (VERIFIED record; mapping ESTIMATED).**
The county PDF says the Southern Hills system "also services South Pointe." The only SDWIS
system matching is **South Pointe Subdivision**:

| Field | Value |
|---|---|
| PWSID | **GA1030107** |
| Name | SOUTH POINTE SUBDIVISION |
| Type | **Community Water System (CWS)** — regulated under SDWA |
| Owner | **Private (P)** |
| Status | Active |
| Source | **Groundwater** |
| Population served | 491 |
| Service connections | 207 |
| Primacy agency | **Georgia EPD** |
| EPD "Outstanding Performer" | **Yes (since 2021-02-12)** |
| Source Water Protection Plan | Yes (2017-09-25) |
| Admin / contact of record | ABBOTT, ANTHONY H · 119 W. Oglethorpe Ave, Savannah GA 31401 · 912-233-3254 · pamonte1@msn.com |

- Sources: `https://data.epa.gov/efservice/WATER_SYSTEM/PWSID/GA1030107/JSON`
- Saved: `sources/water-system-sdwis-GA1030107-2026-06-18.json`

## Compliance / violations — VERIFIED (GA1030107)

11 violations on record, **0 health-based** (`IS_HEALTH_BASED_IND = N` for every record).
All are recurring **monitoring/reporting**-type (violation codes 71/52/23/4G; contaminant
codes 7000/5000/3100/5200 — administrative, **not MCL/contaminant exceedances**). Most
recent began 2024-10-17. No maximum-contaminant-level (health) violations at any time.
- Source: `https://data.epa.gov/efservice/VIOLATION/PWSID/GA1030107/JSON`

Interpretation: Clean from a public-health standpoint; the paperwork lapses are typical of
small privately-run systems and are consistent with the system still holding EPD
"Outstanding Performer" status.

## VA underwriting notes

- VA Minimum Property Requirements treat a connection to a **public/community water system**
  as acceptable when the system is **approved by the state/health authority** — which a
  GA-EPD-regulated CWS is. This **removes** the individual shared-well-agreement requirement
  that would apply to a true 2-home shared well.
- Recurring cost: a metered water bill from Coastal Water Co. (budgeted ~$40/mo in the model;
  **confirm actual tariff** — see 07).
- No private well to test for the appraisal, and no individual well-water potability test
  required by VA for a connection to a regulated CWS (confirm lender overlay).

## Confidence & open items

- **PWSID GA1030107 is the best match but is INFERRED**, on the strength of the county PDF's
  "also services South Pointe" note. It is plausible Southern Hills is a separately numbered
  Coastal Water Co. system. **Confirm the exact PWSID** with the operator and/or GA EPD
  Drinking Water Program before relying (call script in 07). `gadrinkingwater.net` (GA
  Drinking Water Watch) was unavailable (HTTP 503) on 2026-06-18 — retry for the official
  EPD record and latest sample results / CCR.
- Recurring **fees**: pull Coastal Water Co. tariff (base + per-1,000 gal), connection/transfer
  fee, and any deposit. — UNAVAILABLE (operator request, see 07).
- **Recorded shared-well / utility easement / water agreement:** check the deed and plat in
  GSCCCA for any recorded water-service covenant or easement. — UNAVAILABLE (see 01 / 07).
