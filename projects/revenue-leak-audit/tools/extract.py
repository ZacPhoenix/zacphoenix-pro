#!/usr/bin/env python3
"""Deterministic page-structure extractor for the revenue-leak audit."""
import json
import re
import sys
from pathlib import Path

PHONE_RE = re.compile(r"\(?\b\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b")
TAG_RE = re.compile(r"<[^>]+>")


def strip_tags(html: str) -> str:
    html = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style[^>]*>.*?</style>", " ", html, flags=re.S | re.I)
    return re.sub(r"\s+", " ", TAG_RE.sub(" ", html)).strip()


def first(pattern, html, flags=re.S | re.I):
    m = re.search(pattern, html, flags)
    return strip_tags(m.group(1)).strip() if m else None


def all_matches(pattern, html, flags=re.S | re.I):
    return [strip_tags(x).strip() for x in re.findall(pattern, html, flags)]


def analyze(path: Path) -> dict:
    html = path.read_text(errors="replace")
    text = strip_tags(html)
    forms = re.findall(r"<form[^>]*>(.*?)</form>", html, flags=re.S | re.I)
    form_details = []
    for f in forms:
        inputs = re.findall(r"<(?:input|textarea|select)[^>]*>", f, flags=re.I)
        visible = [i for i in inputs if not re.search(
            r'type=["\'](?:hidden|submit|button)', i, re.I)]
        names = [re.search(r'name=["\']([^"\']+)', i).group(1)
                 for i in visible if re.search(r'name=["\']([^"\']+)', i)]
        required = [i for i in visible if re.search(r"\brequired\b", i, re.I)]
        form_details.append({
            "visible_fields": len(visible),
            "required_fields": len(required),
            "field_names": names,
        })
    jsonld_types = []
    for block in re.findall(
            r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
            html, flags=re.S | re.I):
        jsonld_types += re.findall(r'"@type"\s*:\s*"([^"]+)"', block)
    return {
        "file": path.name,
        "title": first(r"<title[^>]*>(.*?)</title>", html),
        "meta_description": first(
            r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', html),
        "h1": all_matches(r"<h1[^>]*>(.*?)</h1>", html),
        "h2": all_matches(r"<h2[^>]*>(.*?)</h2>", html)[:12],
        "phones_in_text": sorted(set(PHONE_RE.findall(text))),
        "tel_links": sorted(set(re.findall(r'href=["\']tel:([^"\']+)', html, re.I))),
        "mailto_links": sorted(set(re.findall(r'href=["\']mailto:([^"\']+)', html, re.I))),
        "forms": form_details,
        "jsonld_types": sorted(set(jsonld_types)),
        "word_count": len(text.split()),
        "img_count": len(re.findall(r"<img\b", html, re.I)),
        "copyright": (re.search(r"(?:©|&copy;|copyright)\s*(\d{4})", html, re.I)
                      or [None]) and (
            re.search(r"(?:©|&copy;|copyright)\s*(\d{4})", html, re.I).group(1)
            if re.search(r"(?:©|&copy;|copyright)\s*(\d{4})", html, re.I) else None),
        "review_mentions": len(re.findall(
            r"\b(?:review|testimonial|stars?|rating)\b", text, re.I)),
        "guarantee_mentions": len(re.findall(r"\b(?:guarantee|warranty)\b", text, re.I)),
        "cta_button_texts": sorted(set(
            t for t in all_matches(
                r'''<(?:a|button)[^>]*class=["'][^"']*(?:btn|button|cta|elementor-button)[^"']*["'][^>]*>(.*?)</(?:a|button)>''',
                html)
            if 0 < len(t) < 60))[:15],
    }


if __name__ == "__main__":
    out = [analyze(p) for p in sorted(Path(sys.argv[1]).glob("*.html"))]
    print(json.dumps(out, indent=1))
