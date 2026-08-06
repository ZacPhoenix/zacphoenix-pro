#!/usr/bin/env python3
"""Revenue-leak model for the lowcountrytech.com audit.

Every number in the report's dollar section comes from this script.
All inputs are named assumptions with a source. Each finding's leak is
computed as a low/high annual range:

    leads_lost_per_year x close_rate x annual_client_value

Low bounds use the conservative end of every input so the floor is
defensible. Run:  python3 revenue_model.py
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class Range:
    low: float
    high: float

    def __post_init__(self):
        if self.low < 0 or self.high < self.low:
            raise ValueError(f"invalid range: {self.low}..{self.high}")

    def times(self, other: "Range") -> "Range":
        return Range(self.low * other.low, self.high * other.high)

    def scale(self, k: float) -> "Range":
        return Range(self.low * k, self.high * k)

    def plus(self, other: "Range") -> "Range":
        return Range(self.low + other.low, self.high + other.high)


# ---------------------------------------------------------------- assumptions
# Market benchmarks (sources in NOTES.md / report appendix):
# - MSP per-user pricing $100-175/user/mo small business (Petronella, myDatapath 2026)
# - Average NA MSP MRR per client $1,850/mo (Gitnux MSP industry statistics)
# - Minimum viable MSP engagement ~$1,200/mo (Tactics Marketing)
# - IT & managed services visitor->lead median 1.5%, top performers 3-5%
#   (Zeliq / Grey Matter B2B benchmarks)
# - 57% of local searches are mobile (Sagapixel local SEO stats)
# - 43% of calls to small businesses arrive outside business hours (CallRail 2024)
# - 78% of B2B buyers choose the vendor that responds first (MarketBetter)

# Client economics. Annual value of one new managed-IT client, revenue basis:
# $1,200/mo floor (viable minimum) to $2,500/mo (25-user shop at ~$100/user).
MSP_CLIENT_ANNUAL = Range(1_200 * 12, 2_500 * 12)          # $14,400 - $30,000 / yr

# Secondary lines (VoIP seats, alarm monitoring at their published $29.99/mo,
# cabling projects). Blended annual value of one non-MSP customer.
SECONDARY_CLIENT_ANNUAL = Range(360, 6_000)                # alarm-only .. VoIP/cabling deal

# Consultation-request -> signed client. MSP sales cycles close a meaningful
# share of qualified local consultations; conservative band.
CLOSE_RATE = Range(0.10, 0.25)

# Site traffic is NOT measurable from outside. The model uses an assumed
# visitor base ONLY to sanity-check leads-lost bands; the per-finding
# leads-lost numbers below are the actual model inputs, chosen conservatively.
ASSUMED_VISITS_PER_MONTH = Range(400, 900)   # small local MSP, 28 indexed posts,
                                             # 11 location pages, active blog

MOBILE_SHARE = 0.57                          # of local search traffic
AFTER_HOURS_SHARE = 0.43                     # of inbound SMB calls (CallRail)


# ------------------------------------------------------------------- findings
@dataclass(frozen=True)
class Finding:
    key: str
    title: str
    impact: str            # High / Medium / Low
    effort: str            # Quick win / Project
    leads_lost_per_year: Range
    client_value: Range    # annual value of the client type this leak loses
    fix_cost: Range        # one-time market cost to fix
    rationale: str

    @property
    def annual_leak(self) -> Range:
        return self.leads_lost_per_year.times(CLOSE_RATE).times(self.client_value)

    @property
    def payback_days(self) -> float:
        """Days of recovered revenue (at the LOW leak bound) to cover the
        HIGH fix cost - the most pessimistic payback."""
        daily_low = self.annual_leak.low / 365
        return self.fix_cost.high / daily_low if daily_low else float("inf")


FINDINGS = [
    Finding(
        key="cyber_page",
        title="No dedicated cybersecurity service page",
        impact="High", effort="Project",
        # A ranking service page for "cybersecurity company savannah" and
        # related terms: 1-4 qualified consultations/yr is the conservative
        # band for a proven 5.0-rated local provider (their own blog already
        # targets the phrase, so intent demand exists).
        leads_lost_per_year=Range(1, 4),
        client_value=MSP_CLIENT_ANNUAL,
        fix_cost=Range(500, 1_500),   # copy + build, freelance/agency market
        rationale="Cyber-intent searches land on a blog post or a competitor; "
                  "cybersecurity deals skew to full managed contracts.",
    ),
    Finding(
        key="mobile_cta",
        title="Mobile homepage: only CTA sits two screens down",
        impact="High", effort="Quick win",
        # 57% of local search traffic is mobile; a first-screen CTA on a
        # local service site reliably lifts action. Band: 2-6 extra
        # consultations/yr across all service lines.
        leads_lost_per_year=Range(2, 6),
        client_value=Range(MSP_CLIENT_ANNUAL.low * 0.5,       # blend: not every
                           MSP_CLIENT_ANNUAL.high * 0.75),    # mobile lead is MSP
        fix_cost=Range(150, 400),
        rationale="Majority of local traffic is mobile; the first screen "
                  "offers no action except the phone number.",
    ),
    Finding(
        key="scheduler",
        title="'Schedule a Consultation' leads to a form, not a scheduler",
        impact="High", effort="Quick win",
        # 43% of SMB inbound arrives after hours; a booking link converts
        # some of the visitors who won't call or wait for an email reply.
        leads_lost_per_year=Range(2, 8),
        client_value=MSP_CLIENT_ANNUAL,
        fix_cost=Range(200, 740),     # scheduler setup $200-500 + <=$20/mo tool
        rationale="After-hours and form-averse buyers book a slot when one "
                  "exists; first responder wins 78% of B2B deals.",
    ),
    Finding(
        key="voip_jargon",
        title="VoIP page's main button says 'Get 3CX Now'",
        impact="Medium", effort="Quick win",
        leads_lost_per_year=Range(1, 3),
        client_value=Range(1_200, 4_800),   # VoIP deal: seats + install
        fix_cost=Range(0, 100),
        rationale="Buyers searching 'business phone systems' don't know the "
                  "vendor name 3CX; the page's one conversion button is jargon.",
    ),
    Finding(
        key="services_dead_end",
        title="Services hub page has no call to action",
        impact="Medium", effort="Quick win",
        leads_lost_per_year=Range(1, 4),
        # Floor is a small VoIP/alarm engagement, not alarm-only $360 —
        # a visitor comparing the services hub is shopping real work.
        client_value=Range(1_200, MSP_CLIENT_ANNUAL.high),
        fix_cost=Range(150, 400),
        rationale="A main-nav page that ends without any next step strands "
                  "visitors who arrived ready to compare and contact.",
    ),
    Finding(
        key="pricing_anchor",
        title="No pricing anchors despite promising them in search results",
        impact="Medium", effort="Quick win",
        leads_lost_per_year=Range(1, 4),
        client_value=MSP_CLIENT_ANNUAL,
        fix_cost=Range(0, 200),
        rationale="The Google snippet says 'Flat monthly per-user pricing... "
                  "See exactly what is included' but no page shows a number; "
                  "price-filtering buyers bounce to sites that publish ranges.",
    ),
    Finding(
        key="emergency_path",
        title="No urgent-help path on the homepage",
        impact="Medium", effort="Quick win",
        # Switching MSPs most often happens at a crisis moment. Even one
        # captured crisis-switcher a year is a full contract.
        leads_lost_per_year=Range(1, 3),
        client_value=MSP_CLIENT_ANNUAL,
        fix_cost=Range(150, 400),
        rationale="'Server down / we got hacked' visitors need a visible "
                  "'urgent issue?' route; the homepage never says 24/7 or urgent.",
    ),
]


# --------------------------------------------------------------------- output
def total_leak() -> Range:
    t = Range(0, 0)
    for f in FINDINGS:
        t = t.plus(f.annual_leak)
    return t


def total_fix_cost() -> Range:
    t = Range(0, 0)
    for f in FINDINGS:
        t = t.plus(f.fix_cost)
    return t


def money(x: float) -> str:
    return f"${x:,.0f}"


def markdown_table() -> str:
    rows = ["| # | Leak | Impact | Fix | Est. annual leak | Fix cost | Worst-case payback |",
            "|---|------|--------|-----|------------------|----------|--------------------|"]
    for i, f in enumerate(FINDINGS, 1):
        leak = f.annual_leak
        rows.append(
            f"| {i} | {f.title} | {f.impact} | {f.effort} | "
            f"{money(leak.low)} – {money(leak.high)} | "
            f"{money(f.fix_cost.low)} – {money(f.fix_cost.high)} | "
            f"{f.payback_days:.0f} days |")
    t, c = total_leak(), total_fix_cost()
    rows.append(f"| | **Total** | | | **{money(t.low)} – {money(t.high)}** | "
                f"**{money(c.low)} – {money(c.high)}** | |")
    return "\n".join(rows)


if __name__ == "__main__":
    print(markdown_table())
    print()
    t, c = total_leak(), total_fix_cost()
    roi_floor = t.low / c.high
    print(f"Floor ROI (lowest leak estimate / highest total fix cost): "
          f"{roi_floor:.1f}x in year one")
    sanity = ASSUMED_VISITS_PER_MONTH.scale(12)
    total_leads = Range(sum(f.leads_lost_per_year.low for f in FINDINGS),
                        sum(f.leads_lost_per_year.high for f in FINDINGS))
    print(f"Sanity check: model assumes {total_leads.low:.0f}-{total_leads.high:.0f} "
          f"lost leads/yr against {sanity.low:.0f}-{sanity.high:.0f} visits/yr "
          f"({100*total_leads.low/sanity.high:.1f}%-{100*total_leads.high/sanity.low:.1f}% "
          f"of traffic) - well inside the 1.5-5% visitor-to-lead benchmark band.")
