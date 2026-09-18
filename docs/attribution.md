# Crediting William E. Doyle across projects

`https://williamdoyle.co.uk/` is the hub. Every project links back to it the same way, so search engines
connect the sites to one person ("William E. Doyle", Cloud / DevOps Engineer) and not the other William Doyles.

## 1. Visible credit (footer)

```html
Built by <a href="https://williamdoyle.co.uk/" rel="author">William E. Doyle</a>
```

Client sites: `Website by <a href="https://williamdoyle.co.uk/" rel="author">William E. Doyle</a>`.

- Anchor text is the name, exactly `William E. Doyle`. Not the bare URL and not keywords.
- Apex host with trailing slash. No `nofollow`.
- Put it in server-rendered HTML where possible. SPAs also get section 2, because it is in the static `index.html`.

## 2. Static entity link (every `index.html`, including SPAs)

```html
<meta name="author" content="William E. Doyle" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",            // or WebSite / Game
  "name": "<Project name>",
  "url": "https://<project host>/",
  "creator": {
    "@type": "Person",
    "@id": "https://williamdoyle.co.uk/#person",
    "name": "William E. Doyle",
    "url": "https://williamdoyle.co.uk/"
  }
}
</script>
```

If the page already has a JSON-LD block, add the `creator` property to it instead of adding a second block.
The `@id` must stay exactly `https://williamdoyle.co.uk/#person`: it is the Person defined in this repo's `index.html`.

## 3. Hub (this repo)

`index.html` defines the Person and WebSite nodes (name, `alternateName` "William Doyle", job title, location, credentials,
`sameAs` profiles). Change facts there only. Private or noindex sites (the weekly Eric's Quiz) get the visible credit only.

## 4. Check it

```sh
python3 scripts/check-attribution.py
```

Fetches each live site and fails if it is down, or is missing the author meta, the `creator` reference or (where server-rendered) the footer anchor.
