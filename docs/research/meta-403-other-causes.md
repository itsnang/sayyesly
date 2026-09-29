# What else makes Meta's crawler get 403 when our own requests get 200?

Research for issue #78 (map: #75). Sources read and live probes run on 2026-09-27, around 15:10–15:20 UTC, against `https://sayyesly.site/invite/M8rqKCdVS6` on `main` at `bac158b`, which includes the robots.txt fix from #73/#74. Sibling tickets cover two causes in depth: #76 (Meta caching robots.txt) and #77 (Vercel's firewall). This note lists every other candidate, says whether it applies here, and says how to confirm it or rule it out.

## Short answer

Nothing in our code, in Next.js, or in the network path before Vercel sends a 403 to a GET on an invite page. Every header, user agent and protocol variant we could send got **200**, and the Open Graph tags sit in `<head>`. Two explanations are left, and neither can be reproduced from outside Meta or Vercel:

1. **Meta is still using its old robots.txt (#76).** Meta says its crawlers "may cache the contents of robots.txt for up to 24 hours". RFC 9309 allows the same limit. Until that copy expires, the Sharing Debugger keeps reporting the robots block as a 403, even though our server now returns 200. **This is the most likely cause.**
2. **A Vercel Firewall rule that matches Meta's IPs or ASN but not ours (#77/#80).** Vercel's *deny* action returns exactly `403 Forbidden`. The managed Bot Protection and Attack Mode let `facebookexternalhit` through as a verified bot. They also can't be what's blocking Meta: our spoofed-UA curl isn't a verified bot, and it got 200, which suggests those modes are off. That leaves a custom rule on IP, ASN or country. Only the owner can see this in Vercel.

## Evidence gathered (read-only probes)

All requests were GET unless noted, with UA `facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)` unless noted. They were sent with plain `curl` from the owner's machine over IPv4, and served by Vercel's `hkg1` edge.

| Request | Result |
| --- | --- |
| Plain | 200, 31.8 kB, ~0.4 s |
| `Range: bytes=0-524287` | 200 (Range ignored, which is allowed; see below) |
| `Accept: */*` + gzip | 200, 7 kB compressed |
| `X-Purpose: preview` / `Sec-Purpose: prefetch` | 200 |
| `Purpose: prefetch` | 200 (proxy skipped by its matcher, so no CSP header; page still renders) |
| HTTP/1.0, IPv4 only | 200 |
| `HEAD` | 200 |
| UA `Facebot`, `meta-externalfetcher/1.1`, `meta-externalagent/1.1`, `WhatsApp/2.23.20.0`, empty UA | 200 |
| `?fbclid=…` | 200 |
| `http://` → 308 https; `www.` → 307 apex; `/i/<slug>` → 308 `/invite/<slug>`; trailing slash → 308 | all end in 200 |
| `og:image` (`/invite/M8rqKCdVS6/opengraph-image?…`) | 200 `image/png`, 51 kB, ~2 s cold |
| `/robots.txt` | 200 `text/plain`, contains the `facebookexternalhit` group with `Allow: /` |

None of the responses carried Cloudflare headers (`cf-ray`, `Server: cloudflare`) or a Vercel mitigation header. All had `Server: Vercel` and `X-Vercel-Id`.

## Candidates, one by one

### 1. Stale robots.txt at Meta: **applies (most likely)**

- Meta: "Please allow up to 24 hours for changes to robots.txt to take effect because crawlers may cache the contents of robots.txt for up to 24 hours." (https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/, "The robots.txt file").
- RFC 9309 §2.4: crawlers "SHOULD NOT use the cached version for more than 24 hours" (https://www.rfc-editor.org/rfc/rfc9309#section-2.4).
- The fix went live today around 15:00 UTC; robots.txt shows `Last-Modified: Sun, 27 Sep 2026 15:11:35 GMT`. The debugger's own wording, "could be due to a robots.txt block", points at Meta's own robots check. If that check refused the URL, Meta never fetched the page, and the 403 is most likely Meta's label rather than a status code our server sent.
- **Confirm:** in Vercel's request logs for `/robots.txt` and `/invite/M8rqKCdVS6`, look for no `facebookexternalhit` hit on the invite path at the time of the debugger run. Then "Scrape Again" in the debugger after 24 h, or after a fresh robots.txt fetch by Meta shows up in the logs. Details belong to #76 and #79.
- Related (RFC 9309 §2.3.1.4): if Meta's robots.txt fetch ever gets a **5xx or a network error**, it "MUST assume complete disallow". Our `/robots.txt` is a Next metadata route served from Vercel's cache (`X-Vercel-Cache: HIT`) and returned 200 every time. It is worth checking in the logs, but it doesn't reproduce.

### 2. Vercel Firewall (custom rule, IP/ASN block, managed rulesets): **possible, owner must check**

- The *deny* action returns "A `403 Forbidden` response" and "The request does not reach your application" (https://vercel.com/docs/vercel-firewall/firewall-concepts#deny). That would explain a 403 that never appears in our app logs.
- `facebookexternalhit` is in Vercel's verified-bots directory (category `preview`), and "Attack Mode and bot protection automatically recognize and allow these bots". Verification uses IP ranges and reverse DNS (https://vercel.com/docs/bot-management#verified-bots). The AI Bots ruleset (log/deny) targets `ai_crawler` bots such as `meta-externalagent`, not `facebookexternalhit`.
- Our spoofed-UA curl comes from a non-Meta IP, so it is **not** a verified bot. If Bot Protection (challenge) or Attack Mode were on, our curl would most likely have hit the Security Checkpoint. It got the page, which points away from those modes. The one firewall setup that fits "their request 403, ours 200" is a **custom rule or IP block keyed on IP, ASN (Meta is AS32934) or country**.
- **Confirm:** Vercel dashboard, then Firewall, then Traffic. Filter by user agent `facebookexternalhit` and look for Deny/Challenge actions. Or check Logs for status 403 on `/invite/*`. See #77 and #80.

### 3. Cloudflare in front of the domain: **doesn't apply**

- The nameservers are Cloudflare (`aspen`/`junade.ns.cloudflare.com`), but the apex and `www` resolve to `64.29.17.1` and `216.198.79.1`. Those addresses are AS16509 (AWS, where Vercel's edge runs), not in Cloudflare's published ranges (https://www.cloudflare.com/ips-v4). Responses carry `Server: Vercel` and no `cf-ray`, so the records are DNS-only (grey cloud) and Cloudflare's WAF and Bot Fight Mode never see the request.
- **Keep it that way:** Vercel warns that Bot Protection "doesn't work when a reverse proxy (e.g. Cloudflare…) is placed in front" (https://vercel.com/docs/bot-management#bot-protection-ruleset-with-reverse-proxies). Turning on the orange cloud would put Cloudflare's bot rules in Meta's path.
- **Confirm:** `nslookup sayyesly.site` returns non-Cloudflare IPs, and `curl -sI` shows no `cf-ray`.

### 4. Crawler source IPs / IPv6: **doesn't apply**

- There is no AAAA record, so Meta can only connect over IPv4, the same path our probes took. No code in the app or `proxy.ts` looks at the client IP for page GETs. `clientIp()` in `src/lib/rate-limit.ts` is used only by the answer action (a POST).
- Meta suggests allow-listing "either the user agent strings or the IP addresses (more secure)" (Meta crawler docs above). That only matters if something blocks by IP, which is candidate 2.

### 5. Request headers (Range, Accept, Purpose, HEAD vs GET): **doesn't apply**

- Meta: the site "should either generate and return a response with all required properties according to the bytes specified in the Range header … or it should ignore the Range header altogether". The server "must use gzip and deflate", and Open Graph must be in the first 1 MB (Meta crawler docs, "Crawler Requirements"). We ignore `Range` (200 with the full body), serve gzip, and the page is 31.8 kB.
- `proxy.ts`'s matcher skips requests carrying `next-router-prefetch` or `purpose: prefetch`. Those requests still render with 200, just without our CSP header. HEAD returns 200.
- **Confirm or re-test:** Meta's own simulation command, `curl -v --compressed -H "Range: bytes=0-524288" -H "Connection: close" -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" "$URL"` (Meta crawler docs, "Troubleshooting").

### 6. Next.js bot handling (`htmlLimitedBots`, streaming metadata): **doesn't apply**

- With streaming metadata, `generateMetadata` output can be appended to `<body>`. For "HTML-limited bots … (e.g. `facebookexternalhit`), metadata continues to block page rendering", so it lands in `<head>` (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`, "Streaming metadata"; config: `…/05-config/01-next-config-js/htmlLimitedBots.md`).
- Next 16.2.7's default list (`node_modules/next/dist/shared/lib/router/utils/html-bots.js`) includes `facebookexternalhit`, `facebookcatalog`, `WhatsApp`, `Twitterbot`, `LinkedInBot`, `Slackbot` and `Discordbot`. It does **not** include `Facebot`, `meta-externalfetcher` or `TelegramBot`.
- Measured: for every UA tested (Meta's, Facebot, meta-externalfetcher, WhatsApp, Chrome), `og:title` sits at byte 2448 and `</head>` at byte 3923. The tags are in the head for everyone, because our metadata resolves before the shell flushes. In any case, streaming metadata can only move or hide tags; it never changes the status code.
- **Guard (optional):** if a future slow `generateMetadata` pushes tags into `<body>` for UAs outside the list, add them via `htmlLimitedBots` (it replaces the default list, so include the defaults too).

### 7. `proxy.ts`, CSP and `next.config.ts` headers: **doesn't apply**

- `src/proxy.ts` returns only two things: a redirect to `/login` for `/dashboard*` and `/preview*` without a session cookie, or `NextResponse.next()` with the CSP. It never sends a 4xx, and `/invite/*` isn't a login path.
- CSP, `X-Frame-Options: SAMEORIGIN`, `nosniff`, `Referrer-Policy` and `Permissions-Policy` (`next.config.ts`) are response headers that a browser enforces on itself. They don't change the status code, and a crawler that only parses HTML ignores them. `upgrade-insecure-requests` only affects subresource URLs in a browser.
- `noindex, nofollow` in the page's metadata is also just markup. Meta's docs mention robots.txt, not meta robots, as its control.

### 8. Next.js itself refusing the request: **doesn't apply**

- In app code, the only 403 is `src/app/api/auth/logout/route.ts` (a cross-origin POST). Next.js's own server has no 403 path for page GETs. The only mention in `node_modules/next/dist/server/lib/router-server.js` is a comment about the `send` module's directory-listing case for static files, which Vercel's routing doesn't use. `allowedDevOrigins` in `next.config.ts` is dev-only. A missing invite gives **404** (`notFound` → `src/app/invite/[slug]/not-found.tsx`), not 403.

### 9. Vercel Deployment Protection: **doesn't apply**

- It guards preview and `*.vercel.app` deployments, not the production domain (our curls got 200 without auth). It would only matter if a `*.vercel.app` URL were pasted into Meta.

### 10. Timeouts / slow responses: **doesn't apply to the 403**

- Meta: "Ensure that the content can be crawled by the crawler within a few seconds". The page answers in ~0.4 s. The `og:image` took ~2 s cold, which is fine but the slowest part. A timeout would show up as a fetch error or a missing image, not as a 403.

## Where the 403 is most likely coming from

1. Meta's cached robots.txt (#76). Wait out 24 h, or check the logs for a fresh robots.txt fetch, then Scrape Again (#79).
2. A Vercel Firewall custom rule or IP/ASN block (#77/#80). Check Firewall → Traffic for `facebookexternalhit`.
3. Everything else above has been ruled out by probes or by reading the code.

## Sources

- Meta Web Crawlers: https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/ (updated May 21, 2026)
- RFC 9309 Robots Exclusion Protocol, §2.3.1.4 and §2.4: https://www.rfc-editor.org/rfc/rfc9309
- Vercel Firewall actions (deny = 403, challenge): https://vercel.com/docs/vercel-firewall/firewall-concepts
- Vercel bot management, verified bots, reverse-proxy caveat: https://vercel.com/docs/bot-management
- Vercel Attack Mode, known bots: https://vercel.com/docs/vercel-firewall/attack-mode
- Vercel managed rulesets: https://vercel.com/docs/vercel-firewall/vercel-waf/managed-rulesets
- Cloudflare IPv4 ranges: https://www.cloudflare.com/ips-v4
- Next.js 16.2.7 docs: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` (Streaming metadata), `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/htmlLimitedBots.md`; bot list `node_modules/next/dist/shared/lib/router/utils/html-bots.js` (upstream: https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/router/utils/html-bots.ts)
- This repo: `src/proxy.ts`, `next.config.ts`, `src/app/robots.ts`, `src/app/layout.tsx`, `src/app/invite/[slug]/page.tsx`, `src/features/invites/server/metadata.ts`
