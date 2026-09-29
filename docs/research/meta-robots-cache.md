# Does Meta's crawler cache robots.txt, and report a robots block as 403?

Research for issue #76 (map: #75). Sources read on 2026-09-27. Documented facts come from Meta's developer docs (fetched from `developers.facebook.com/documentation/...`; the old `/docs/sharing/webmasters/crawler` URL now redirects to the Web Crawlers page) and RFC 9309. Developer reports come from Stack Overflow and are marked as such.

## Short answer

- **Yes, it caches robots.txt, for up to 24 hours (documented).** Meta: "crawlers may cache the contents of robots.txt for up to 24 hours", so allow up to 24 hours for changes to take effect.
- **Scrape Again does not refresh robots.txt (not documented either way; developer reports say it doesn't).** Meta documents that the Sharing Debugger and the Graph API `scrape=true` refresh the *page's* scraped metadata. Nothing says they re-read robots.txt. A developer who hit our exact error text saw it clear by itself about 12 hours after changing robots.txt, without any other change.
- **The debugger reports a robots block as "Response Code: 403" (inferred, not documented).** The hint text "This response code could be due to a robots.txt block" is the debugger's own wording, and the Stack Overflow reports show 403 while the site's logs showed 200 or no request at all. Meta doesn't document how it labels a robots-blocked URL.
- **UA-specific group over `*` (standard, but Meta's parser isn't documented).** Meta says it follows "industry-standard practices like robots.txt". Under RFC 9309 a crawler obeys only its matching group, and `*` applies only when no group matches. Groups for the same token merge; `*` is never merged in. Our file is correct under the standard.

Confidence: high on the 24-hour cache; medium on "Scrape Again doesn't refresh robots.txt" and "403 means robots block"; medium-high that Meta picks the specific group the standard way.

**Implication for our 403:** robots.txt was changed today (`Last-Modified: Sun, 27 Sep 2026 15:11:35 GMT` on the live file), so Meta may still be using the old `Disallow: /invite/` copy until about 2026-09-28 15:11 UTC. Scraping again before then is expected to keep showing 403. If it still shows 403 after that, look for a real block (Vercel Firewall or bot protection against Meta's IPs). Our own curl doesn't come from Meta's network, so it can't rule that out.

## What Meta documents

### Meta Web Crawlers page

https://developers.facebook.com/docs/sharing/webmasters/web-crawlers (redirects to `/documentation/sharing/webmasters/web-crawlers`, "Updated: May 21, 2026"). `/docs/sharing/webmasters/crawler` redirects here too.

- FacebookExternalHit "crawl[s] the content of an app or website that was shared on one of Meta's family of apps, such as Facebook, Instagram, or Messenger" and "gathers, caches, and displays" title, description and thumbnail.
- UA strings: `facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)` and `facebookexternalhit/1.1`. The product token to target in robots.txt is `facebookexternalhit`.
- Robots.txt is the supported control: "We make it easy ... by using industry-standard practices like robots.txt". To block a crawler, "add a disallow for the relevant crawler to robots.txt". The example uses a UA-specific group (`User-agent: meta-externalagent`, `Allow: /`, `Disallow: /private/`).
- **Caching:** "Please allow up to 24 hours for changes to robots.txt to take effect because crawlers may cache the contents of robots.txt for up to 24 hours."
- FacebookExternalHit "might bypass robots.txt when performing security or integrity checks". Meta-ExternalFetcher "may bypass robots.txt" because its fetches are requested by a user.
- Troubleshooting: "If your app or website content is not available at the time of crawling, you can force a crawl once it becomes available either by passing the URL through the Sharing Debugger tool or by using the Sharing API." This forces a crawl of the URL. It says nothing about robots.txt.
- Simulating the crawler: `curl -v --compressed -H "Range: bytes=0-524288" -H "Connection: close" -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" "$URL"`.
- The page also lists meta-webindexer, meta-externalads, meta-externalagent and meta-externalfetcher. **It doesn't list `Facebot`** anymore. Keeping it in our group does no harm. WhatsApp isn't mentioned either. WhatsApp previews are fetched with a `WhatsApp/...` UA (not checked here).
- The page doesn't mention the debugger's response code for a robots block, a way to purge the robots.txt cache, or how Meta resolves groups beyond calling it the "industry-standard" robots.txt.

### Sharing Best Practices

https://developers.facebook.com/docs/sharing/best-practices

- "The debug tool also refreshes any scraped content we have for your websites, so it can be useful if you need to update them more often than the standard 24 hour update period." This covers scraped page content. Robots.txt isn't mentioned.

### Optimizing Metadata / Webmasters overview

- https://developers.facebook.com/docs/sharing/webmasters/optimizing: "The first time someone shares or likes a URL, the Facebook Crawler caches the resolved canonical URL and its metadata. You can view the results of this cache or force a re-scrape with the Sharing Debugger."
- https://developers.facebook.com/docs/sharing/webmasters: "The debugger also triggers a scrape of your page".

### Graph API URL node (programmatic re-scrape)

https://developers.facebook.com/docs/graph-api/reference/url/

- `POST https://graph.facebook.com/{version}/?id={url}&scrape=true&access_token=...` returns `{"success": true}`. It's described as updating a URL's scraped info. Nothing says it re-reads robots.txt. Scraping again through the API is most likely subject to the same robots cache as the debugger (inferred).

### Link Sharing FAQ

https://developers.facebook.com/docs/sharing/webmasters/faq

- Covers image caching, response code 0 (missing AAAA record), relative URLs and "Refresh share attachment". **Nothing about robots.txt or 403.**

## The standard: RFC 9309 (Robots Exclusion Protocol)

https://www.rfc-editor.org/rfc/rfc9309

- §2.2.1: crawlers "MUST use case-insensitive matching to find the group that matches the product token and then obey the rules of the group". Several groups matching the same token "MUST be combined into one group". "If no matching group exists, crawlers MUST obey the group with a user-agent line with the "*" value". So `*` is a fallback, and it never merges with a specific group.
- §2.1: a group may start with several `user-agent` lines, as ours does (`facebookexternalhit`, `Facebot`, `WhatsApp`, ...).
- §2.4: "Crawlers MAY cache the fetched robots.txt file's contents... SHOULD NOT use the cached version for more than 24 hours, unless the robots.txt file is unreachable." Meta's 24 hours matches this upper bound.

Under this standard, our live file gives `facebookexternalhit` `Allow: /`, `Disallow: /api/`, `Disallow: /dashboard`, so `/invite/M8rqKCdVS6` is allowed. Meta doesn't publish its parser, so "Meta follows §2.2.1" is inferred from its "industry-standard" statement. Nobody in the sources below reports Meta merging `*` into a specific group.

## Developer reports (not documentation)

- **Stack Overflow 78933121**, "Facebook share links The document returned no data. 403" (Aug 2024): https://stackoverflow.com/questions/78933121/facebook-share-links-the-document-returned-no-data-403
  - The debugger showed 403 with the same hint we see: "This response code could be due to a robots.txt block. Please allowlist facebookexternalhit on your sites robots.txt config". Meanwhile the site's Cloudflare logs showed Meta's bot getting **200 OK** on every Scrape Again. So the debugger reported 403 without the site sending one.
  - The only answer is from the same person: after adding a `User-agent: facebookexternalhit` / `Allow: /` group above the existing `User-agent: *` group, "The issue resolved it's self for me after almost 12 hours". Scraping again in between didn't clear it. This fits a cached robots.txt (under 24 h) that Scrape Again doesn't refresh.
  - A second answer (2025) had a different cause: the hosting company was blocking Meta's crawler for aggressive crawling, and changing robots.txt didn't help. **The same 403 plus robots hint can come from a real server-side block.**
- **Stack Overflow 79932770**, "Cloudflare + Facebook Sharing Debugger: Worker returns 200 with valid OG tags, but Meta reports 403" (2026, unanswered): https://stackoverflow.com/questions/79932770/cloudflare-facebook-sharing-debugger-worker-returns-200-with-valid-og-tags-b
  - A curl with the facebookexternalhit UA from the developer's machine returns 200, but the debugger shows 403. Some of Meta's scrapes never reached the Worker. The developer suspects the edge (Cloudflare AI Labyrinth or bot rules) was intercepting Meta-network requests. This is the same shape as our case. A curl test from outside Meta's network (AS32934) doesn't show what Meta's crawler receives.
- **Stack Overflow 12880456** (2012): https://stackoverflow.com/questions/12880456/facebook-crawler-bot-crashing-site. Old answers claim facebookexternalhit didn't request or respect robots.txt at the time. The current docs and the debugger's own robots hint replace this. It's only historical context.

## What this means for sayyesly.site

1. Live robots.txt (fetched 2026-09-27 15:13 UTC): the specific group for `facebookexternalhit`/`Facebot`/`WhatsApp`/... allows `/invite/`, and `*` still disallows it. It's correct under RFC 9309. The response has `Cache-Control: public, max-age=0, must-revalidate` and `Last-Modified: Sun, 27 Sep 2026 15:11:35 GMT`. Meta's documented cache can hold the old copy until about **2026-09-28 15:11 UTC**, whatever our cache headers say (inferred, since RFC 9309 only says "MAY use standard cache control").
2. Until then, "Response Code 403" with the robots hint is expected, and Scrape Again or `scrape=true` probably won't change it.
3. After 24 hours, scrape again. If it's still 403, it's likely a real block. Check Vercel Firewall / Attack Challenge Mode / bot protection logs for requests to `/invite/M8rqKCdVS6` from Meta's ASN 32934. Also use Meta's "See exactly what our scraper sees" view (`https://developers.facebook.com/tools/debug/echo/?q=<url>`, linked from the SO report above) to see the raw response.
4. Meta has no documented way to flush its robots.txt cache sooner. The Web Crawlers page lists webmasters@meta.com as the contact.

## Open questions

- Whether the debugger ever shows a *different* code (for example 0 or "blocked") for a robots block, as opposed to a 403 the site really sent. Not documented. Only the reports above cover it.
- Whether the robots.txt cache is per host and shared between the debugger and live-share crawling. Not documented.
