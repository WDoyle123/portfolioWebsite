#!/usr/bin/env python3
"""Check that every live site credits https://williamdoyle.co.uk/ (see docs/attribution.md)."""
import json
import re
import sys
import time
import urllib.request

PERSON_ID = "https://williamdoyle.co.uk/#person"
ANCHOR = re.compile(r'<a[^>]+href=["\']https://williamdoyle\.co\.uk/?["\'][^>]*>\s*William E\. Doyle\s*</a>', re.I | re.S)
AUTHOR_META = re.compile(r'<meta[^>]+name=["\']author["\'][^>]+content=["\']William E\. Doyle["\']', re.I)
LD_JSON = re.compile(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', re.I | re.S)

# url, needs footer anchor in raw HTML (server-rendered). SPAs render the anchor with JS, so only the static tags are checked.
SITES = [
    ("https://petrolmoney.co.uk/", True),
    ("https://www.stellarphysicshub.com/", True),
    ("https://pizzamath.williamdoyle.co.uk/", True),
    ("https://tescodle.com/", False),
    ("https://daily.ericsquiz.com/", False),
    ("https://ericsquiz.com/", True),
    ("https://garmda.com/", False),
]


def fetch(url):
    sep = "&" if "?" in url else "?"
    req = urllib.request.Request(f"{url}{sep}cb={time.time_ns()}", headers={"User-Agent": "Mozilla/5.0 (attribution-check)"})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.status, response.read().decode("utf8", "replace")


def has_person_ref(node):
    if isinstance(node, dict):
        return node.get("@id") == PERSON_ID or any(has_person_ref(v) for v in node.values())
    if isinstance(node, list):
        return any(has_person_ref(v) for v in node)
    return False


def check_hub(problems):
    status, html = fetch("https://williamdoyle.co.uk/")
    if status != 200:
        problems.append(f"hub: HTTP {status}")
    if '<link rel="canonical" href="https://williamdoyle.co.uk/"' not in html:
        problems.append("hub: canonical must be https://williamdoyle.co.uk/")
    person = False
    for block in LD_JSON.findall(html):
        try:
            data = json.loads(block)
        except ValueError:
            problems.append("hub: invalid JSON-LD")
            continue
        person = person or has_person_ref(data)
    if not person:
        problems.append(f"hub: JSON-LD does not define {PERSON_ID}")
    _, robots = fetch("https://williamdoyle.co.uk/robots.txt")
    if "Sitemap: https://williamdoyle.co.uk/sitemap.xml" not in robots or "<html" in robots.lower():
        problems.append("hub: robots.txt missing or wrong")
    _, sitemap = fetch("https://williamdoyle.co.uk/sitemap.xml")
    if "<urlset" not in sitemap:
        problems.append("hub: sitemap.xml missing (SPA fallback?)")


def check_spoke(url, needs_anchor, problems):
    try:
        status, html = fetch(url)
    except Exception as error:  # noqa: BLE001 - report every failure kind
        problems.append(f"{url}: unreachable ({error})")
        return
    if status != 200:
        problems.append(f"{url}: HTTP {status}")
        return
    if not AUTHOR_META.search(html):
        problems.append(f'{url}: missing <meta name="author" content="William E. Doyle">')
    refs = False
    for block in LD_JSON.findall(html):
        try:
            refs = refs or has_person_ref(json.loads(block))
        except ValueError:
            problems.append(f"{url}: invalid JSON-LD")
    if not refs:
        problems.append(f"{url}: no JSON-LD creator referencing {PERSON_ID}")
    if needs_anchor and not ANCHOR.search(html):
        problems.append(f'{url}: no footer link "William E. Doyle" -> https://williamdoyle.co.uk/')


def main():
    problems = []
    try:
        check_hub(problems)
    except Exception as error:  # noqa: BLE001
        problems.append(f"hub: unreachable ({error})")
    for url, needs_anchor in SITES:
        check_spoke(url, needs_anchor, problems)
    if problems:
        print("\n".join(f"FAIL {p}" for p in problems))
        return 1
    print(f"OK: hub and {len(SITES)} sites credit William E. Doyle")
    return 0


if __name__ == "__main__":
    sys.exit(main())
