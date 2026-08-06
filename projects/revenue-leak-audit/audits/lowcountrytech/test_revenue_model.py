#!/usr/bin/env python3
"""Gate tests for revenue_model.py. Deterministic, <2s, no network."""
import unittest

from revenue_model import (CLOSE_RATE, FINDINGS, MSP_CLIENT_ANNUAL, Range,
                           markdown_table, total_fix_cost, total_leak)


class TestRange(unittest.TestCase):
    def test_rejects_negative_and_inverted(self):
        with self.assertRaises(ValueError):
            Range(-1, 5)
        with self.assertRaises(ValueError):
            Range(10, 5)

    def test_times_multiplies_bounds(self):
        r = Range(2, 3).times(Range(10, 20))
        self.assertEqual((r.low, r.high), (20, 60))

    def test_plus_adds_bounds(self):
        r = Range(1, 2).plus(Range(3, 4))
        self.assertEqual((r.low, r.high), (4, 6))


class TestModel(unittest.TestCase):
    def test_every_finding_has_valid_ranges(self):
        for f in FINDINGS:
            self.assertGreater(f.leads_lost_per_year.high, 0, f.key)
            self.assertGreaterEqual(f.leads_lost_per_year.low,
                                    f.leads_lost_per_year.low)
            self.assertGreater(f.client_value.low, 0, f.key)
            self.assertGreaterEqual(f.fix_cost.high, f.fix_cost.low, f.key)

    def test_cyber_page_hand_math(self):
        f = next(x for x in FINDINGS if x.key == "cyber_page")
        # 1 lead x 10% close x $14,400 = $1,440 low
        self.assertAlmostEqual(f.annual_leak.low,
                               1 * CLOSE_RATE.low * MSP_CLIENT_ANNUAL.low)
        # 4 leads x 25% close x $30,000 = $30,000 high
        self.assertAlmostEqual(f.annual_leak.high,
                               4 * CLOSE_RATE.high * MSP_CLIENT_ANNUAL.high)

    def test_total_is_sum_of_findings(self):
        t = total_leak()
        self.assertAlmostEqual(t.low, sum(f.annual_leak.low for f in FINDINGS))
        self.assertAlmostEqual(t.high, sum(f.annual_leak.high for f in FINDINGS))

    def test_low_bound_is_conservative_floor(self):
        # The floor must stay in defensible territory: a small number of
        # modest contracts, not a scary made-up figure.
        self.assertLess(total_leak().low, 30_000)
        self.assertGreater(total_leak().low, 5_000)

    def test_fix_costs_stay_small_relative_to_leak_floor(self):
        self.assertGreater(total_leak().low, total_fix_cost().high)

    def test_payback_days_finite_and_positive(self):
        for f in FINDINGS:
            self.assertGreater(f.payback_days, 0, f.key)
            self.assertLess(f.payback_days, 1_500, f.key)

    def test_portfolio_payback_under_six_months(self):
        # The report claims the whole fix list pays for itself fast even at
        # the floor: total max fix cost / (floor leak per day) < 180 days.
        days = total_fix_cost().high / (total_leak().low / 365)
        self.assertLess(days, 180)

    def test_markdown_table_lists_all_findings(self):
        table = markdown_table()
        for i, f in enumerate(FINDINGS, 1):
            self.assertIn(f.title, table)
        self.assertIn("**Total**", table)

    def test_finding_count_within_report_cap(self):
        self.assertLessEqual(len(FINDINGS), 10)
        self.assertGreaterEqual(len(FINDINGS), 5)


if __name__ == "__main__":
    unittest.main()
