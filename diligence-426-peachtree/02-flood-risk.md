# 02 — Flood Risk

**Property:** 426 Peachtree Drive, Rincon, GA 31326 · Parcel 0435A084 · 32.21248, -81.254227
**Pulled:** 2026-06-18

## Finding — VERIFIED

| Field | Value |
|---|---|
| Flood Zone | **X** |
| Zone subtype | **AREA OF MINIMAL FLOOD HAZARD** |
| In Special Flood Hazard Area (SFHA)? | **No** (`SFHA_TF = "F"`) |
| FIRM Panel | **13103C0360E** |
| Panel effective date | **2015-03-16** |
| DFIRM ID | 13103C |
| Base Flood Elevation | None (N/A for Zone X) |

**Source:** FEMA National Flood Hazard Layer (NFHL), public ArcGIS REST service —
point query at the parcel lat/long.
- Flood hazard layer (L28): `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query`
- FIRM panel layer (L3): `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/3/query`
- Raw JSON saved: `sources/fema-nfhl-query-2026-06-18.json`

## Insurance implications

- **No federally mandated flood insurance.** Zone X is outside the SFHA, so a federally
  regulated/VA lender will **not** require an NFIP flood policy as a condition of the loan.
  (Mandatory purchase applies only to zones A__ and V__.)
- **VA:** VA will not condition the loan on flood insurance for a Zone-X parcel. No
  elevation certificate required.
- **Recommended anyway (ESTIMATED, optional):** A preferred-risk / Zone-X flood policy in
  coastal GA typically runs ~$400–$700/yr. Low cost relative to risk; ~25% of NFIP claims
  come from outside the SFHA. Treat as optional, not budgeted in the base run rate.

## Caveats / open items
- The query is by lat/long, not by surveyed parcel boundary. If any portion of the 0.48-ac
  lot touches a mapped stream/AE fringe, a small sliver could differ. Confirm with the
  county floodplain administrator or a FEMA MSC "Search by Address" printout if a lender
  flood determination ever flags it. (See 07-human-actions.md.)
- A standard lender flood determination (LOMA/LOMC check) will be ordered at application;
  this is expected to confirm Zone X.
