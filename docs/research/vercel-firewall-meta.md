# Does Vercel's firewall or bot protection block Meta's crawler?

Research for [#77](https://github.com/itsnang/sayyesly/issues/77) (map: #75). Researched 2026-09-27.

**Symptom.** Meta's Sharing Debugger reports `403` for `https://sayyesly.site/invite/M8rqKCdVS6`. Our own requests with Meta's user agent get `200`. We checked again on 2026-09-27:

```
curl -sI -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" https://sayyesly.site/invite/M8rqKCdVS6
HTTP/1.1 200 OK
Server: Vercel
X-Matched-Path: /invite/[slug]
X-Vercel-Id: hkg1::sin1::fmr6l-...
```

The live `robots.txt` now has a `facebookexternalhit` / `Facebot` group with `Allow: /`.

## Short answer

- **Yes, Vercel's own protection can return a 403 or a challenge to Meta.** The source that matters most is the **always-on platform DDoS mitigation**. It runs on every plan, you can't switch it off permanently, and it runs *before* your WAF custom rules. During May 2026 many Vercel customers saw it deny Meta's crawler and Vercel's own screenshot bot. Vercel staff said a fix was deployed on 2026-05-12. Similar reports kept appearing after that date: one in September 2026, and several where Vercel staff blamed Meta's debugger cache instead.
- **The opt-in features should not block Meta's link-preview crawler.** Bot Protection is off by default. So are the AI Bots ruleset and Attack Mode. `facebookexternalhit` is on Vercel's verified-bots list, and Bot Protection and Attack Mode are documented to let verified bots through. The exceptions are a **custom rule** or the **AI Bots ruleset in Deny mode**. The AI Bots ruleset would catch `meta-externalagent` (categorised `ai_crawler`), and it may also catch `facebookexternalhit`, although Vercel files that one under `preview`.
- **Deployment Protection does not apply to a production custom domain** unless the scope is "All Deployments", or the plan is Enterprise with Trusted IPs. We also get `200` without logging in, which rules it out anyway.
- **Where to look:** go to the project, then **Firewall**. The **Overview** page has Rules, Events and Denied IPs. The **Traffic** page can be filtered by action and grouped by User Agent or ASN; Meta's ASN is **AS32934**. Also check **Firewall → Rules** for the Bot Management toggles and any custom rules.

Confidence: **high** on the documented behaviour. **Medium** on the cause for sayyesly specifically: whether our 403 comes from Vercel or is a stale result in Meta's debugger can only be settled in our Firewall dashboard.

## 1. Which Vercel layers can answer Meta with 403 or a challenge

Documented order of evaluation: the platform-wide firewall (DDoS mitigation) runs first, then Deployment Protection, then your project's WAF rules. Within the WAF, custom rules run before managed rulesets.
Sources: [Firewall concepts: How Vercel secures requests](https://vercel.com/docs/vercel-firewall/firewall-concepts#how-vercel-secures-requests), [Managed rulesets: Rules execution order](https://vercel.com/docs/vercel-firewall/vercel-waf/managed-rulesets#rules-execution-order).

What a blocked request looks like:

- **Deny** returns `403 Forbidden`, and the request never reaches the app. ([Firewall concepts: Deny](https://vercel.com/docs/vercel-firewall/firewall-concepts#deny))
- **Challenge** serves the "Vercel Security Checkpoint" JavaScript page. Non-browser clients "(bots, scripts, etc.) cannot" pass it. ([Firewall concepts: Challenge](https://vercel.com/docs/vercel-firewall/firewall-concepts#challenge)) The docs don't say which status code a failed challenge returns. One community report saw `429` with the Security Checkpoint HTML ([community #17033](https://community.vercel.com/t/v0-api-http-429-security-checkpoint-errors-when-calling-from-vps/17033)). So a challenged Meta fetch might show up as 429 rather than 403, but this is not documented.

| Layer | Default | Can it hit Meta's crawler? | Documented fact |
|---|---|---|---|
| **Platform DDoS mitigation** (system mitigations) | Always on, all plans | **Yes.** It can challenge or block, and it runs before custom rules | "We block incoming traffic if we identify abnormal or suspicious levels of incoming requests". It also says it is "challenging or blocking requests if they appear illegitimate". ([DDoS Mitigation](https://vercel.com/docs/vercel-firewall/ddos-mitigation)) WAF bypass rules "**do not** bypass system-level mitigations such as DDoS Mitigation" ([Rule configuration: Actions](https://vercel.com/docs/vercel-firewall/vercel-waf/rule-configuration#actions)) |
| **Bot Protection managed ruleset** | **Off** | Not for verified bots | It serves a JS challenge to non-browser clients. It "automatically excludes verified bots, such as Google's crawler, from evaluation". Modes are Log or Challenge; there is no Deny mode. ([Bot Management](https://vercel.com/docs/bot-management#bot-protection-managed-ruleset), [Managed rulesets](https://vercel.com/docs/vercel-firewall/vercel-waf/managed-rulesets#configure-bot-protection-managed-ruleset)) |
| **AI Bots managed ruleset** | **Off** ("Allow") | **Yes, if set to Deny.** It blocks bots Vercel lists as AI bots (`meta-externalagent`, `meta-webindexer` are `ai_crawler`) | Modes are Log or Deny. "Deny: This action blocks all traffic identified as coming from AI bots." The list is maintained by Vercel. ([Managed rulesets: AI Bots](https://vercel.com/docs/vercel-firewall/vercel-waf/managed-rulesets#configure-ai-bots-managed-ruleset)) The docs don't list which bots it covers. `facebookexternalhit` is categorised `preview`, not `ai_crawler`, so it is probably not covered, but that is our inference. |
| **Attack (Challenge) Mode** | Off | Not for verified bots | Visitors get challenged, "while known bots (like search engines and webhook providers) are automatically allowed through". ([Attack Mode](https://vercel.com/docs/vercel-firewall/attack-mode)) "Known bots are validated to be authentic and cannot be spoofed" ([changelog, 2025-04-01](https://vercel.com/changelog/attack-challenge-mode-now-allows-verified-bots-and-vercel-cron-jobs)) |
| **WAF custom rules / IP blocking / OWASP ruleset** | None | Yes, if one matches (Deny gives 403) | You write these yourself. Verified bots are not exempt from custom rules; the docs tell you to use them to block specific known bots. ([Bot Management: Verified bots](https://vercel.com/docs/bot-management#verified-bots)) |
| **Deployment Protection** | Standard Protection | **Not on a production custom domain** unless the scope is "All Deployments" | "Standard Protection: Protects all deployments **except** production domains". "All Deployments: Protects **all** URLs, including production domains". Unauthenticated visitors get a Vercel login redirect. ([Deployment Protection](https://vercel.com/docs/deployment-protection), [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)) |

## 2. Is `facebookexternalhit` a verified bot, and are verified bots exempt?

- **Yes, it is on the list.** Vercel's [Verified bots directory](https://vercel.com/docs/bot-management#verified-bots-directory) lists these Meta crawlers:
  - `facebookexternalhit`, category *preview*: "Fetches content for shared links on Meta platforms to generate rich previews."
  - `meta-externalagent`: *ai_crawler*
  - `meta-externalfetcher`: *user_initiated*
  - `meta-externalads`: *advertising*
  - `meta-webindexer`: *ai_crawler*
  - `facebook-webhooks`: *webhook*
  - **Facebot is not listed** by that name.
- **How Vercel verifies a bot:** by IP range, by reverse DNS and by cryptographic Web Bot Auth, not by user agent alone. ([Bot verification methods](https://vercel.com/docs/bot-management#bot-verification-methods)) So a `curl -A facebookexternalhit` from our own machine is **not** a verified bot. Only requests from Meta's own IPs are.
- **Which protections exempt verified bots:**
  - **Exempt:** Bot Protection and Attack Mode. "Attack Mode and bot protection automatically recognize and allow these bots to pass through without being challenged." ([Verified bots](https://vercel.com/docs/bot-management#verified-bots))
  - **Not documented as exempt:** DDoS mitigation.
  - **Not exempt:** custom rules and the AI Bots ruleset. Both act on whatever matches them.

## 3. Community reports (not official docs)

- **May 2026 incident.** Starting around 2026-05-02, many Hobby users saw 403s with `x-vercel-mitigation: deny`, attributed to "DDoS Mitigation" in Firewall → Traffic. Victims included Vercel's screenshot bot, some real visitors and Meta's crawler. Vercel staff (anshumanb) wrote on 2026-05-12: "our team has confirmed that a fix has been deployed for this issue." A few people still reported problems afterwards. ([community #40244](https://community.vercel.com/t/deployment-thumbnail-shows-error-forbidden-403-live-site-works-fine/40244))
- **Meta-specific reports with the same shape as ours.** In each one, `curl` with Meta's UA returns 200, the debugger returns 403, and other crawlers are fine:
  - [#41089 wellow.fyi, Next.js 16, Hobby](https://community.vercel.com/t/meta-facebook-crawler-receives-403-from-vercel-edge-only-for-wellow-fyi/41089)
  - [#41229](https://community.vercel.com/t/facebookexternalhit-blocked-by-automatic-ddos-mitigation-on-hobby-project/41229): the Firewall Overview showed "~41 Challenged requests per hour from the DDoS Mitigation rule", and a UA bypass custom rule did not help
  - [#41308](https://community.vercel.com/t/security-firewall/41308): a UA bypass rule did not help, and Bot Protection was enabled
  - [#42022](https://community.vercel.com/t/meta-facebook-sharing-debugger-returns-403-on-vercel-but-browser-and-curl-return-200/42022)
  - [#49028, 2026-09-09, still open](https://community.vercel.com/t/facebookexternalhit-gets-a-persistent-403-on-our-custom-domain-every-other-crawler-gets-200/49028)
- **Vercel staff take** (twwright, 2026-05-22, [#41685](https://community.vercel.com/t/facebookexternalhit-receiving-persistent-403-on-custom-domain-all-other-scrapers-work/41685)): they "did not identify any active blocks or deny actions affecting Facebook crawler traffic", and the reports resolved without Vercel changing anything. Their advice:
  - Press **Scrape Again 2–3 times**. The debugger caches per domain, so even a fresh path or `?v=2` can return a stale result.
  - Check that `robots.txt` has no `Disallow: /*?*` under `*` that overrides the Meta group.
  - Add a custom rule "bypass if ASN equals 32934" (Meta).
  - The debugger's 403 "does not necessarily indicate that Vercel is actively returning a 403".

## 4. Where a block shows in the dashboard

Official source: [Firewall Observability](https://vercel.com/docs/vercel-firewall/firewall-observability). Open the project, then **Firewall**:

- **Overview.** Pick the past hour, the past 24 hours or a live 10-minute window. It has four sections:
  - **Alerts**: large attacks
  - **Rules**: traffic broken down by the rule that applied
  - **Events**: actions by the platform-wide firewall, *including DDoS mitigations*; each event can be expanded to show the client's requests
  - **Denied IPs**
- **Traffic.** Filter by rule or by action (for example deny or challenge), and group by Client IP, **User Agent**, Request Path, **ASN**, JA4 or Country. To find Meta, group by User Agent `facebookexternalhit` or by ASN 32934, and look at the deny and challenge actions around the time you pressed Scrape Again.
- **Rules.** The Bot Management section shows the state of Bot Protection, the AI Bots ruleset and Attack Mode. Custom rules are listed here too.
- **Response headers** (community-sourced, not in the docs we read): Vercel firewall blocks carry `x-vercel-mitigated: deny` or `challenge`. Our own 403 page would not have this header.
- **CLI:** `vercel firewall` can explore traffic and manage rules. ([CLI docs](https://vercel.com/docs/cli/firewall))

## 5. How to allow-list Meta's crawler

1. **WAF custom rule with Bypass.** Custom rules are free on all plans ([WAF pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/usage-and-pricing)). Match on **ASN = 32934**, which is better than matching the user agent because anyone can spoof a UA. Then place the rule first. Bypass skips "any custom or managed rules" ([Firewall concepts: Bypass](https://vercel.com/docs/vercel-firewall/firewall-concepts#bypass)), so it fixes blocks from the AI Bots ruleset or our own rules. It does **not** get past DDoS mitigation.
2. **System Bypass Rule**, for blocks by DDoS mitigation. It matches an IP or CIDR plus a domain, and it is **Pro or Enterprise only** (Pro: 25 per project, Hobby: not available). ([System Bypass Rules](https://vercel.com/docs/vercel-firewall/vercel-waf/system-bypass-rules)) The downside is that Meta rotates crawler IPs.
3. **Pause System Mitigations.** This lasts 24 hours, from the Firewall tab's "…" menu. It is only useful to confirm a diagnosis, and you pay for any attack traffic while it is paused. ([DDoS Mitigation: Bypass System-level Mitigations](https://vercel.com/docs/vercel-firewall/ddos-mitigation#bypass-system-level-mitigations))
4. **On Hobby**, when DDoS mitigation is the cause and none of the above is available, the only option is to report it to Vercel (Security/Abuse form or support) with request IDs and timestamps. That is what the community threads did.

## What to check for sayyesly

1. Go to Firewall → Traffic for the last 24 hours. Filter to the deny and challenge actions and group by User Agent or ASN. Do any requests from `facebookexternalhit` or AS32934 appear, and which rule is named: "DDoS Mitigation", a managed ruleset or a custom rule?
2. Go to Firewall → Rules. Confirm that Bot Protection, the AI Bots ruleset and Attack Mode are set to Off / Allow, and that no custom rule matches Meta.
3. Go to Settings → Deployment Protection. Confirm the scope is not "All Deployments".
4. If there are **no** Meta hits in Firewall, press Scrape Again 2–3 times. The 403 is probably a stale debugger result from before the robots.txt fix, or coming from the app itself.
