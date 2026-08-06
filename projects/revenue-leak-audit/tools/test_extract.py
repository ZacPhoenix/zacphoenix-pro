#!/usr/bin/env python3
"""Gate tests for extract.py against a fixture page. No network."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

FIXTURE = """<html><head>
<title>Acme Plumbing | Savannah, GA</title>
<meta name="description" content="Emergency plumbing in Savannah.">
<script type="application/ld+json">{"@type":"ProfessionalService"}</script>
</head><body>
<h1>Emergency Plumbing</h1><h2>Water Heaters</h2>
<p>Call (912) 555-1234 today. 100% satisfaction guarantee.</p>
<a href="tel:+19125551234">call</a>
<a class="btn" href="/contact">Get a Quote</a>
<form action="/submit">
  <input type="text" name="name" required>
  <input type="hidden" name="token">
  <textarea name="message"></textarea>
  <input type="submit" value="Go">
</form>
&copy; 2023 Acme
</body></html>"""


class TestExtract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        Path(cls.tmp.name, "fixture.html").write_text(FIXTURE)
        out = subprocess.run(
            [sys.executable, str(Path(__file__).parent / "extract.py"),
             cls.tmp.name],
            capture_output=True, text=True, check=True)
        cls.page = json.loads(out.stdout)[0]

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_title_and_meta(self):
        self.assertEqual(self.page["title"], "Acme Plumbing | Savannah, GA")
        self.assertEqual(self.page["meta_description"],
                         "Emergency plumbing in Savannah.")

    def test_headings(self):
        self.assertEqual(self.page["h1"], ["Emergency Plumbing"])
        self.assertEqual(self.page["h2"], ["Water Heaters"])

    def test_phone_and_tel(self):
        self.assertEqual(self.page["phones_in_text"], ["(912) 555-1234"])
        self.assertEqual(self.page["tel_links"], ["+19125551234"])

    def test_form_counts_visible_fields_only(self):
        form = self.page["forms"][0]
        self.assertEqual(form["visible_fields"], 2)   # name + message
        self.assertEqual(form["required_fields"], 1)
        self.assertIn("name", form["field_names"])

    def test_jsonld_guarantee_copyright_cta(self):
        self.assertEqual(self.page["jsonld_types"], ["ProfessionalService"])
        self.assertEqual(self.page["guarantee_mentions"], 1)
        self.assertEqual(self.page["copyright"], "2023")
        self.assertEqual(self.page["cta_button_texts"], ["Get a Quote"])


if __name__ == "__main__":
    unittest.main()
