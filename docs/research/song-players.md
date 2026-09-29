# How do YouTube and Spotify players behave on phones and in Telegram's browser?

Research for [#102](https://github.com/itsnang/sayyesly/issues/102) (part of the map #101, "a Song on an Invite").
Written 2026-09-28.

How sure each answer is, and where it comes from:

- **(docs)**: the service's or browser's official documentation says so.
- **(source)**: read in the browser's or Telegram's own source code (links below). This is strong evidence, but it
  describes the code, not a test on a phone.
- **(measured)**: tried from here on 2026-09-28 with curl or headless Chromium on a desktop. It proves how the
  API behaves. It does **not** prove how a phone's autoplay rules behave.
- **(developer reports)**: Stack Overflow, GitHub issues, community forums or blogs. Not official.
- **(inferred)**: our reasoning from the above. Needs an on-device test.
- **unknown**: the evidence ran out. See the test plan at the end.

## The browsers a Recipient actually uses

Recipients mostly open the Invite from a Telegram chat. By default both Telegram apps open links in **Telegram's
own browser**, not Safari or Chrome. So we have four cases, and they behave differently:

| Where the Invite opens | Engine | Media rule (what a page may play without a tap) |
|---|---|---|
| iPhone Safari | WebKit | Sound needs a user gesture. Muted video may autoplay. |
| iPhone, **Telegram's browser** (default) | `WKWebView` | **No gesture needed for any media.** Telegram sets `mediaTypesRequiringUserActionForPlayback = []`. |
| Android Chrome (or Chrome Custom Tabs, if the user picked that in Telegram) | Chromium, "document user activation" policy | Sound is allowed once the user has tapped the **top page**, and an iframe inherits that if it has `allow="autoplay"`. |
| Android, **Telegram's browser** (default) | Android `WebView`, "user gesture required" policy | Sound needs a gesture **inside the frame that plays it**. Telegram relaxes this after the first touch, but only for media created after it (details under question 2). |

Sources:

- Telegram iOS opens links in its own `BrowserScreen` unless the user switched to an external browser. The default
  is `openExternalBrowser: false`
  ([OpenUrl.swift](https://github.com/TelegramMessenger/Telegram-iOS/blob/master/submodules/TelegramUI/Sources/OpenUrl.swift),
  [AccountWebBrowserSettings.swift](https://github.com/TelegramMessenger/Telegram-iOS/blob/master/submodules/TelegramCore/Sources/Settings/AccountWebBrowserSettings.swift)).
  **(source)**
- That browser's `WKWebViewConfiguration` sets `allowsInlineMediaPlayback = true` and
  `mediaTypesRequiringUserActionForPlayback = []`
  ([BrowserWebContent.swift](https://github.com/TelegramMessenger/Telegram-iOS/blob/master/submodules/BrowserUI/Sources/BrowserWebContent.swift),
  around line 260). **(source)** Its only injected video script adds `playsinline` to every `<video>`, in every frame
  (same file, `videoSource`).
- Telegram Android chooses between its in-app browser (`openInTelegramBrowser` → `ArticleViewer`, which uses
  `BotWebViewContainer.MyWebView`), Chrome Custom Tabs, or an external browser, based on the account's web-browser
  settings
  ([Browser.java](https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/messenger/browser/Browser.java),
  [MessagesController.java](https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/messenger/MessagesController.java)
  `isWebBrowserOpenInApp`). **(source)**
- In `MyWebView`, every page load calls `setMediaPlaybackRequiresUserGesture(true)` (`onPageStarted`). The first
  `ACTION_DOWN` touch anywhere on the WebView calls `setMediaPlaybackRequiresUserGesture(false)` (`onTouchEvent`)
  ([BotWebViewContainer.java](https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/ui/web/BotWebViewContainer.java)).
  It also accepts third-party cookies (`setAcceptThirdPartyCookies(webView, true)`). **(source)**
- WebView maps that setting to Blink's autoplay policy: `true` → `kUserGestureRequired`, `false` →
  `kNoUserGestureRequired`
  ([aw_settings.cc](https://source.chromium.org/chromium/chromium/src/+/main:android_webview/browser/aw_settings.cc)).
  **(source)**

## 1. Full song or preview?

**YouTube: the full video, to anyone, logged in or not.** No official page promises this. It follows from the
IFrame API playing the video itself, and nothing in the API or player docs limits length
([IFrame API](https://developers.google.com/youtube/iframe_api_reference)). Ads may play first, because the embed
loads the ad scripts (see question 6). **(measured)**: logged out, headless Chromium played from 0:45 onward with no
cut-off. Confidence: high.

**Spotify: a ~30-second preview for almost every Recipient.**

- **(measured)**: logged out, the iFrame API's `playback_update` reported `duration: 29713` (29.7 s) for a 3:34 track.
- **(docs)**: Spotify says "in some situations the Embed will only stream a preview clip of less than 30 seconds".
  Its only listed causes are a missing `allow="encrypted-media"`, a modified iframe tag, or an unsupported browser
  ([Troubleshooting](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting)). The official
  docs do **not** state the logged-in rule.
- **(developer reports)**: Spotify staff and community answers say full tracks need the listener **logged in to
  Spotify in that browser**, usually Premium, and several say it works on desktop only
  ([community thread](https://community.spotify.com/t5/Spotify-for-Developers/30-second-preview-showing-when-try-to-embed-playlist/td-p/5655204)).

**Does logging in inside Telegram's browser change that?**

- **iPhone: effectively no.** The embed is a cross-site iframe, so it needs Spotify's cookies as third-party
  cookies. WebKit blocks "cookies for cross-site resources … by default across the board"
  ([WebKit blog](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)), and ITP "is enabled by
  default in all `WKWebView` applications" since iOS 14
  ([WebKit blog](https://webkit.org/blog/10882/app-bound-domains/)). **(docs + inferred)**
- **Android: possible in principle, rare in practice.** Telegram's WebView accepts third-party cookies (source above),
  so a Recipient who logs in to Spotify Premium inside Telegram's browser *might* get full tracks. Whether Spotify's
  embed then plays full tracks on a phone is **unknown**; the reports above say desktop only.
- Either way, almost no Recipient will be logged in to Spotify inside Telegram's browser.

**Plan for the 30-second preview.** Which 30 seconds play is Spotify's choice. The track page's `og:audio` points to
a `p.scdn.co/mp3-preview/…` file **(measured)**, so we can't pick the chorus.

## 2. Starting from our own tap somewhere else on the page

This is the key question. It comes down to one thing: **does our tap count as a gesture inside the player's
iframe?** The player is a cross-origin iframe. Under the HTML standard, a tap activates the tapped document, its
ancestors, and only its **same-origin** descendants
([HTML, activation notification](https://html.spec.whatwg.org/multipage/interaction.html#activation-notification)),
so a YouTube or Spotify iframe does not get our tap's activation directly. Each engine then has its own way around
that:

**Android Chrome (and Chrome Custom Tabs): yes, for both services. Confidence: high.**
Chrome's policy: sound is allowed if "the user has interacted with the domain", and "top frames can delegate autoplay
permission to their iframes" with `allow="autoplay"`
([Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)). In Blink's code, `IsDocumentAllowedToPlay`
walks from the iframe up through its parents and allows playback if any of them has **sticky** user activation, as
long as the autoplay permission is delegated at each step
([autoplay_policy.cc](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/media/autoplay_policy.cc)).
**(source)**

Both players' iframes already carry `allow="…autoplay…"`:
YouTube's API-created iframe has `accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;
picture-in-picture; web-share`, and Spotify's has `autoplay; clipboard-write; encrypted-media; fullscreen;
picture-in-picture` **(measured)**. After the Recipient taps our "tap to open", `player.playVideo()` or
`controller.play()` can run at any time, even after async work. **(measured)**: in headless Chromium a click on a
separate button started YouTube (unmuted, at 0:45) and Spotify. Headless Chromium's autoplay flags may differ from a
phone's, so treat this as proof that the API calls work. The permission rule itself comes from the source code.

**iPhone Safari: YouTube probably yes, if `playVideo()` is called synchronously in the tap handler. Spotify unknown.**
WebKit forwards the current user gesture through `postMessage`: `processPostMessage` captures
`UserGestureIndicator::currentUserGesture()` and re-applies it when the message is delivered to the iframe, if it
hasn't expired
([LocalDOMWindow.cpp](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/LocalDOMWindow.cpp)). The
limit is `maximumIntervalForUserGestureForwarding { 1_s }`
([UserGestureIndicator.h](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/dom/UserGestureIndicator.h)).
**(source)** Both iframe APIs talk to their player by `postMessage`, so a synchronous `playVideo()` in our `click`
handler reaches YouTube's player *with* the gesture.

Two things can still break it: **(inferred)**

- The player must be **ready** (`onReady` fired, video cued). If it isn't, the call is queued and the gesture is lost.
- The player must call `media.play()` while handling that message. YouTube's player keeps a `<video>` element
  (measured: present before any tap), so this is likely.

Spotify's docs warn: "Safari blocks autoplay without user interaction"
([iFrame API reference](https://developer.spotify.com/documentation/embeds/references/iframe-api)). Spotify's embed
has **no** `<video>`/`<audio>` in its DOM before or during playback **(measured)**, and it buffers before starting
(first `playback_update` shows `isBuffering: true, duration: 0`) **(measured)**. If it awaits a network call before
`play()`, the forwarded gesture may be gone. **Unknown**, device test needed.

**iPhone, Telegram's browser: yes for both, probably even without a tap. Confidence: medium-high.**
Telegram's `WKWebView` requires no user action for any media (source above). Our tap therefore doesn't need to reach
the iframe at all. What's left:

- the service's own player logic;
- YouTube's rule that an API client "must not initiate an automatic playback until the player is visible and more
  than half of the player is visible"
  ([Required Minimum Functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)).
  That is a policy rule for us, not a technical block.

**Android, Telegram's browser: Spotify probably yes. YouTube probably not unless we create the player after the
first touch. Confidence: medium (source code, not tested).**

- The page loads under `kUserGestureRequired`. Blink computes a media element's lock **when the element is
  created** (`locked_pending_user_gesture_ = ComputeLockPendingUserGestureRequired(...)` in the `AutoplayPolicy`
  constructor). A locked element unlocks only with a **transient** activation in its **own** frame
  (`TryUnlockingUserGesture`) ([autoplay_policy.cc](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/media/autoplay_policy.cc)).
  Chromium does not forward gestures through `postMessage` the way WebKit does. **(source)**
- Telegram flips the WebView to "no gesture required" on the first touch, but that only helps media elements
  created **after** the flip. **(source + inferred)**
- YouTube's embed creates its `<video>` when the player loads, before any tap **(measured)**, so that element stays
  locked. A tap on our button then probably gives `onAutoplayBlocked`, or silence.
- Spotify's embed creates its audio at play time (none in the DOM before play) **(measured)**, so it is probably
  unlocked by then.

**Workaround to test**: in Telegram Android only, create (or re-create) the YouTube player after the first touch,
with `autoplay=1`. Its `<video>` is then born unlocked. This conflicts with iPhone Safari, where the player must
already be ready at tap time, so it needs per-environment handling or a single test-driven compromise.

**Tapping the player itself** always counts as a gesture in its own frame on every platform. It is the fallback
when anything above fails. YouTube's `onAutoplayBlocked` event tells us when to show "tap the player to play"
([IFrame API](https://developers.google.com/youtube/iframe_api_reference)).

## 3. Before any tap

**With sound: no, except in Telegram's iPhone browser.**

- Chrome: muted autoplay is always allowed; sound needs interaction ([Chrome](https://developer.chrome.com/blog/autoplay)).
- iOS Safari: "`<video muted>` elements will also be allowed to autoplay without a user gesture"; sound needs one
  ([WebKit](https://webkit.org/blog/6784/new-video-policies-for-ios/)). **(docs)**
- Telegram iOS: `mediaTypesRequiringUserActionForPlayback = []` means sound may start with no tap at all
  **(source)**. Whether YouTube or Spotify then actually start on `autoplay=1` / `play()` is **unknown** without a
  device test.

**Muted start, then unmute on the first tap:**

- **YouTube: works on Android Chrome** (`mute=1&autoplay=1`, then `unMute()`). Blink's `RequestAutoplayUnmute`
  succeeds once the document is allowed to play, which the parent's sticky activation provides **(source)**.
- **On iPhone Safari it probably works** if `unMute()` runs synchronously in the tap handler: the gesture is
  forwarded, and WebKit only pauses on unmute "without a user gesture" **(source + docs, inferred)**.
- **In Telegram Android it probably fails**: the element is locked, and unmuting a locked element fails and pauses it
  (`RequestAutoplayUnmute` → `IsGestureNeededForPlayback`) **(source, inferred)**.
- Muted playback runs on from wherever it started, so on unmute we should `seekTo(start)`, or the song is already
  partway through.
- YouTube's policy also forbids starting playback until more than half the player is visible (RMF above), so a
  hidden, muted pre-roll isn't allowed anyway.
- **Spotify: no.** The iFrame API has no mute or volume method: the reference lists only `play`, `togglePlay`,
  `resume`, `pause`, `seek`, `loadUri`, `destroy`
  ([iFrame API reference](https://developer.spotify.com/documentation/embeds/references/iframe-api)). **(docs)**

## 4. Start at a chosen moment, loop, or cap the length

**YouTube: all three. Confidence: high.**

- `start` (seconds) and `end` (seconds) player parameters, or `startSeconds`/`endSeconds` in
  `loadVideoById`/`cueVideoById` ([player parameters](https://developers.google.com/youtube/player_parameters),
  [IFrame API](https://developers.google.com/youtube/iframe_api_reference)). **(docs)** **(measured)**: `start=45`
  began at 0:45.
- Loop: "set the `loop` parameter value to `1` and set the `playlist` parameter value to the same video ID" (docs).
  Developer reports say a looped video restarts from 0:00, not from `start`. The reliable way to loop a clip is
  `onStateChange` → `ENDED` → `seekTo(start)` + `playVideo()`. Once the element has played with sound, later plays
  are not re-blocked **(inferred)**.

**Spotify: start time yes (within what plays), cap yes (ourselves), loop only ourselves.**

- `loadUri(spotifyUri, preferVideo, startAt)` with "the timestamp (in seconds) from where playback should start when
  the `play` method is called", and `seek(seconds)`. The docs describe `seek` for podcast episodes; whether it works
  on tracks is **unknown** ([iFrame API reference](https://developer.spotify.com/documentation/embeds/references/iframe-api)).
- For the ~30 s preview (question 1), a "start at 0:45" is meaningless: the preview is its own clip.
- Cap or loop: listen to `playback_update` (`position`, `duration`, `isPaused`) and call `pause()`, or
  `seek(0)` + `resume()`. There is no built-in loop or end time. **(docs + inferred)**

## 5. Title, artist and cover without an API key

**Yes, for both, from oEmbed, with no key.** Do it on the server when the Creator saves.

**YouTube oEmbed** `https://www.youtube.com/oembed?format=json&url=<link>` **(measured)**:

- Returns `title`, `author_name` (the **channel** name, e.g. "Rick Astley", but often "Artist - Topic" or a label
  channel, not a clean artist), `thumbnail_url` (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`, 480×360, 4:3 with
  letterbox bars), and `html`.
- Accepted all of: `youtube.com/watch?v=`, `m.youtube.com/watch?v=`, `youtu.be/<id>?si=…`, `youtube.com/shorts/<id>`,
  `music.youtube.com/watch?v=`.
- Unknown video → `404 Not Found`. The endpoint also sends CORS headers, but a server fetch is simpler for our CSP.
- **(developer reports)**: oEmbed returns `401 Unauthorized` when the owner turned off embedding
  ([lychee #214](https://github.com/lycheeverse/lychee/issues/214)). That lets us warn the Creator at save time.
- No official page documents YouTube's oEmbed endpoint or its rate limits (**unknown**). It is the standard oEmbed
  discovery link on YouTube watch pages.

**Spotify oEmbed** `https://open.spotify.com/oembed?url=<link>`
([reference](https://developer.spotify.com/documentation/embeds/reference/oembed),
[tutorial](https://developer.spotify.com/documentation/embeds/tutorials/using-the-oembed-api)):

- Returns `title`, `thumbnail_url` (300×300 album cover), `iframe_url` and `html`. **No artist field.** **(docs + measured)**
- Accepted: `open.spotify.com/track/<id>`, `open.spotify.com/intl-de/track/<id>?si=…`, and `spotify:track:<id>`
  URIs **(measured)**.
- The docs say `spotify.link` short links work: "Most pages on open.spotify.com, or the short link version
  (https://spotify.link), support oEmbed". **(docs)** A made-up `spotify.link` code returned `504 upstream request
  timeout` rather than 404 **(measured)**, so treat slow or 5xx as "couldn't read this link". With a real short link
  this is **untested**.
- **The artist, if we want it**, needs an undocumented source:
  - the track page's Open Graph tags: `og:description` = "Rick Astley · Whenever You Need Somebody · Song · 1987",
    `og:image` 640×640, `music:duration`;
  - or the JSON inside `open.spotify.com/embed/track/<id>` (`"artists":[{"name":…}]`, `"duration"`,
    `"isPlayable"`).

  Both are **(measured)**, **not** official, and could change. The Web API gives artists officially but needs a
  client id and secret.

## 6. Cost to the page, cookies, and our Content-Security-Policy

**Weight (measured, headless desktop Chromium, cold cache, before any tap).**

YouTube, one player via `YT.Player`:

- about 16 requests from the page, plus the embed document itself;
- about **0.7 MB compressed**: `base.js` 474 KB, `www-player.css` 57 KB, embed HTML 58 KB, Roboto font 39 KB,
  thumbnail 14 KB, plus the `ytembeds` bundles, which we didn't size;
- hosts contacted: `www.youtube.com`, `i.ytimg.com`, `yt3.ggpht.com`, `fonts.gstatic.com`,
  `googleads.g.doubleclick.net`, `static.doubleclick.net`, `www.google.com`, `jnn-pa.googleapis.com`.

Spotify, one track via `createController`:

- about 36 requests;
- about **0.8 MB compressed**: ~20 Next.js chunks from `embed-cdn.spotifycdn.com` (the largest are 125 KB, 128 KB
  and 101 KB), two fonts from `encore.scdn.co` (~90 KB), a 33 KB cover;
- it also sends telemetry to `*.ingest.us.sentry.io`, `apresolve.spotify.com` and `gae2-spclient.spotify.com`.

Browsers partition their HTTP cache by top-level site, so a Recipient's earlier YouTube or Spotify visits don't make
this cheaper. **(inferred from standard cache partitioning)**

**Cookies (measured, desktop Chromium, third-party cookies allowed).**

- `www.youtube.com` embed: `YSC` (session), `VISITOR_INFO1_LIVE`, `VISITOR_PRIVACY_METADATA`, `__Secure-YNID` and
  `__Secure-ROLLOUT_TOKEN` (about 6 months), all on `.youtube.com`, `SameSite=None`.
- `www.youtube-nocookie.com` embed: **no cookies** at load. That is YouTube's "privacy-enhanced mode", where the view
  "will not be used to personalize the YouTube browsing experience"
  ([YouTube Help](https://support.google.com/youtube/answer/171780)). It still loads the same player and may use
  local storage (**unknown**).
- Spotify embed: `sp_t` (1 year) and `sp_landing` (1 day) on `.spotify.com`.
- On iPhone (Safari and Telegram's `WKWebView`), WebKit blocks these third-party cookies anyway (question 1 sources).
  Telegram Android accepts them.

**CSP changes we'd need** (current policy: `src/proxy.ts`):

- `frame-src`: add `https://www.youtube.com` (or `https://www.youtube-nocookie.com` if we use privacy-enhanced
  mode; the IFrame API's `host` config selects it) and `https://open.spotify.com`.
- `script-src`: **no new hosts**, as long as our own nonce'd code inserts the loader scripts. Under `'strict-dynamic'`,
  scripts added with `createElement` by a trusted script are trusted, and host lists are ignored
  ([CSP3 `strict-dynamic`](https://www.w3.org/TR/CSP3/#strict-dynamic-usage)). **(measured)**: both loaders insert
  their next script with `createElement`. YouTube's `iframe_api` even copies the nonce from `document.currentScript`.
- Everything else runs inside the players' own iframes, under **their** CSP, not ours.
- `img-src` already allows `https:`, which covers stored covers.
- `connect-src`: nothing new if oEmbed is fetched on the server.
- **Referrer**: YouTube requires embeds to "provide identification through the `HTTP Referer` request header" and
  recommends `strict-origin-when-cross-origin`
  ([RMF](https://developers.google.com/youtube/terms/required-minimum-functionality)). We already send exactly that
  (`next.config.ts`). **(developer reports)**: sites with `no-referrer` now get "Error 153 Video player configuration
  error" ([Simon Willison](https://til.simonwillison.net/youtube/fixing-153-embed)).
- **Permissions-Policy**: our header (`camera=(), microphone=(), geolocation=(), payment=(), usb=()`) doesn't touch
  `autoplay`, so iframe delegation works.
- The studio preview (`/preview/theme` in a same-origin iframe) inherits autoplay as a same-origin frame
  ([Chrome](https://developer.chrome.com/blog/autoplay): "Autoplay is allowed by default on same-origin iframes").
  **(docs)**

**YouTube policy limits that shape the design (docs):**

- The player must be at least **200×200 px** ([IFrame API](https://developers.google.com/youtube/iframe_api_reference)).
- No overlays on the player ([RMF](https://developers.google.com/youtube/terms/required-minimum-functionality)).
- No background player: content must not play "from a background player, meaning a player that is not displayed in
  the page, tab, or screen that the user is viewing".
- We may not "separate, isolate, or modify the audio or video components"
  ([Developer Policies III.I](https://developers.google.com/youtube/terms/developer-policies)).

So **a hidden or tiny YouTube player that plays only the music is not allowed**. The Theme must show the YouTube
player, at least 200×200, somewhere on screen while it plays. Spotify's embed has no such written rule in the docs we
found; its compact player is 152 px tall (oEmbed default).

## 7. Region, age and "embedding off"

**YouTube (docs):**

| Case | What happens |
|---|---|
| Owner turned off embedding | `onError` code **101**, and **150** ("the same as 101"): "The owner of the requested video does not allow it to be played in embedded players". |
| Removed or private | `onError` code **100**, "video requested was not found". |
| Age-restricted | "Age-restricted videos can't be watched on most 3rd party websites. These videos will redirect viewers back to YouTube when played" ([YouTube Help](https://support.google.com/youtube/answer/171780)). Viewers can still click "Watch on YouTube". |
| Blocked in the viewer's country | No documented error code. **(developer reports)** say the player shows "Video unavailable" and fires 150/101. **Unknown** for Cambodia specifically. |

Error codes: [IFrame API `onError`](https://developers.google.com/youtube/iframe_api_reference).

At save time, oEmbed `401` catches "embedding off" (developer reports, question 5). Region and age limits are only
visible through the Data API (`status.embeddable`, `contentDetails.regionRestriction`, `contentRating`), which needs
an API key. Or through `onError` on the Recipient's device.

**What the Recipient sees:** YouTube's own grey "Video unavailable" / "Watch on YouTube" panel inside the player.
Our page can listen to `onError` and swap in a friendlier Theme-drawn message.

**Spotify:**

- **(developer reports)**: embeds show "This track is not available in your country" / "This content is not
  available" when the exact track version isn't licensed where the listener is
  ([community](https://community.spotify.com/t5/Content-Questions/This-Track-is-Not-Available-in-Your-Country-But-it-Is/td-p/4516384)).
- The embed page JSON has an `isPlayable` flag **(measured)**. Whether it reflects the viewer's region is **unknown**.
- The iFrame API documents no error event; only `ready`, `playback_update` and `playback_started`
  ([reference](https://developer.spotify.com/documentation/embeds/references/iframe-api)). So we can only detect "it
  never started" (no `playback_started` within a few seconds).
- Spotify has no age-gating of embeds in its docs (**unknown**).

## What this means for the map (#101)

**"Start on the first tap" by service and browser:**

| | YouTube | Spotify |
|---|---|---|
| Android Chrome | Yes, high | Yes (preview), high |
| iPhone Safari | Probably yes, if `playVideo()` runs synchronously in the tap and the player is ready | **Unknown**, Spotify warns Safari blocks it |
| Telegram iPhone | Yes, probably even with no tap | Yes (preview), probably |
| Telegram Android | Probably **no** as-is; maybe yes if the player is created after the first touch | Probably yes (preview) |

Always keep a fallback: "tap the player to play", shown when YouTube fires `onAutoplayBlocked` or `onError`, or when
Spotify doesn't report `playback_started` within a few seconds.

**Other points for the map:**

- **Spotify = a 30-second preview** for nearly every Recipient, chosen by Spotify, not the chorus. The editor should
  say so when a Creator pastes a Spotify link.
- **YouTube = the full song, but the video must be visible** (≥200×200, no overlays, not hidden). Each Theme that
  supports a Song must place a visible YouTube player. It can't be a hidden audio-only element.
- **What to store** (open question on the map): oEmbed gives title and cover for both without a key, and the channel
  name for YouTube. The Spotify artist needs undocumented scraping or the Web API. Fetch once on save and store:
  service, id, title, cover URL, and optionally artist. Don't fetch on every Invite view.
- **CSP**: add the two `frame-src` hosts; no `script-src` hosts. Keep `Referrer-Policy: strict-origin-when-cross-origin`.
- **Privacy page**: loading at open sends the visit to Google (YouTube plus doubleclick ad hosts) or Spotify (plus
  Sentry), and sets the cookies listed above where the browser allows third-party cookies.
  `youtube-nocookie.com` removes the YouTube cookies at load.

## On-device test plan (settles every "unknown" above)

One static test page on a real HTTPS preview deploy, since Telegram needs a public URL. It has:

- a YouTube player (`YT.Player`, `playsinline=1`, `start=45`) and a Spotify controller, both loaded at page open;
- a big "tap to open" button **outside** the players, whose click handler synchronously calls `player.playVideo()`
  (or `controller.play()`);
- a second button that creates a fresh YouTube player with `autoplay=1` after the tap (the Telegram Android
  workaround);
- a "muted start" variant (`mute=1&autoplay=1`, then `unMute()` + `seekTo(45)` on tap);
- an on-screen log of `onReady`, `onStateChange`, `onAutoplayBlocked` and `onError` (YouTube), and `ready`,
  `playback_update` and `playback_started` (Spotify, including `duration`, to see preview vs full).

Open the link from a Telegram chat on one iPhone and one Android phone, and also in Safari and Chrome. Record for
each of the 4 environments × 2 services: sound after the outside tap (yes/no), `duration`, and any blocked or error
event. About 20 minutes of testing.
