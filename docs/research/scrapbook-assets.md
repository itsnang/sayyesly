# How should the binder Theme draw its scrapbook pieces, and which fonts fit?

Research for [#153](https://github.com/itsnang/sayyesly/issues/153) (part of the map #148, "a binder Theme with a
Plan of several Stops"). Written 2026-10-04.

How sure each answer is, and where it comes from:

- **(repo)**: read in this repository's code.
- **(docs)**: the Next.js docs shipped in `node_modules/next/dist/docs/` (Next.js 16.2.7), or an asset library's own
  licence file or licence page.
- **(measured)**: downloaded on 2026-10-04 from the first-party source (Google Fonts CSS2 API with an iPhone Safari
  user agent, so the `woff2` files a phone gets; raw files from each library's GitHub repo) and counted in bytes.
- **(inferred)**: our reasoning from the above.

## Recommendation

**Draw every scrapbook piece in code (CSS backgrounds and inline SVG), as Envelope and Kitten Soft already do. Ship no
image files for decoration.** The whole decoration kit costs about the same as Envelope's `ornaments.tsx`, ~2.5 KB
gzipped of JavaScript, against ~20–45 KB *per piece* for raster stickers or tape. The only real download the Theme adds
is two fonts, ~45 KB together. If hand-drawn stickers turn out too slow to make, take flat SVGs from **Microsoft Fluent
Emoji (MIT)** and inline them; avoid every licence that needs on-page attribution or share-alike.

| Piece | Approach | Extra bytes on the invite page |
|---|---|---|
| Grid paper pages | CSS: two `linear-gradient`s, the same as Kitten Soft's ground | 0 (a few lines of style) |
| Grey board behind the binder | CSS colour + Envelope's `GRAIN` SVG-noise data URI | ~0.5 KB (the data URI) |
| Six metal rings | Inline SVG: one ring drawn once with a metallic `linearGradient`, repeated 6× | < 1 KB |
| Red elastic band | CSS: a red strip with a `linear-gradient` sheen and a soft `box-shadow`, `rotate()` slightly | 0 |
| Washi tape | CSS: a translucent strip (`rgba`) with a `repeating-linear-gradient` stripe or dot, zig-zag ends by `clip-path: polygon(...)`. Envelope's `Photo` already tapes photos this way | 0 |
| Polaroid frames | CSS: white padding thicker at the bottom, `box-shadow`, `rotate()`; the photo goes through `next/image` as today. A copy of Envelope's `Photo` | 0 (the Creator's photo is the only image) |
| Paper clips | Inline SVG: one rounded stroke path with a grey gradient | < 0.5 KB |
| Stickers (hearts, stars, sparkles, coffee…) | Inline SVG doodles in the house style (Envelope's `Star`, `Sun`, `Leaf`); fallback: Fluent Emoji *Flat* SVGs, inlined | ~1–2 KB for a set drawn by hand; Fluent Flat 1.1–3.9 KB each |
| Handwriting / marker labels | Fonts: Caveat + Architects Daughter (already on every page) + **Permanent Marker** | +28.6 KB |
| Chunky display title | Font: **Bagel Fat One** (fallback **Titan One**) | +16.3 KB (Titan One 10.5 KB) |

## 1. How the existing Themes draw decorations (house style)

Nothing decorative in the Themes is an image file. Every ornament is CSS or inline SVG. **(repo)**

- **Envelope** (`src/features/invites/themes/envelope/ornaments.tsx`): paper grain and fibres are SVG `feTurbulence`
  noise tiles inlined as `data:image/svg+xml` URIs (`GRAIN`, `FIBRES`); `PaperFilters` renders three shared SVG filters
  once (`env-deckle` torn edges, `env-ink` wobbly ink, `env-wash` watercolour bleed); doodles (`Sun`, `Star`, `Leaf`,
  `FlowerRow`, `PaperPlane`, `Arrow`, `InkCircle`) are small inline SVGs coloured by `--env-*` CSS variables from
  `palette.ts`. `Photo` is already a taped, tilted photo card: white padding, two-layer `box-shadow`, `rotate()`, and a
  tape strip made of one `rgba(236,226,205,.72)` span. The file is 7.7 KB raw, **2.5 KB gzipped**. **(repo, measured)**
- **Envelope** also draws the envelope itself in CSS (`sealed-envelope.tsx`, `clip-path` + `GRAIN`/`FIBRES`), and its
  ruled paper is a `repeating-linear-gradient` (`letter-reply.tsx`, and the `diary-paper` utility in
  `src/app/globals.css`). **(repo)**
- **Kitten Soft / Kitten Night** (`kitten-soft-invite.tsx`, `kitten-night-invite.tsx`): the graph-paper ground is two
  `linear-gradient`s on a 26 px grid plus two `radial-gradient` glows. Hand-drawn borders and underlines use one SVG
  displacement filter (`WobbleFilter`, `#wobble`) in `kitten-soft/shared.tsx`; the confetti is text glyphs
  (`♥ ♡ ✓ ✦ ★`) in the hand font. **(repo)**
- The only raster files a Theme loads are content: the Creator's photos (through `next/image`, optimised when on R2),
  and Kitten Soft's cat (`public/cat-nobg.png`, 821 KB on disk, served resized by `next/image`). The link-preview
  images (`og-image.tsx`) draw with `next/og` and read TTFs from `assets/`. **(repo)**

So a binder Theme drawn in code fits the house style: a `binder/ornaments.tsx` with its own filters, colours as
`--binder-*` variables from a `palette.ts` (shared with its link-preview image, as Envelope does). **(inferred)**

## 2. Code vs image files: page weight on mobile data

Measured reference points:

| What | Size | Note |
|---|---|---|
| Envelope's whole `ornaments.tsx` (all doodles, filters, grain) | 2.5 KB gzipped | JS, shipped once **(measured)** |
| Kitten Soft's `shared.tsx` (filter, borders, confetti) | 2.5 KB gzipped | **(measured)** |
| Fluent Emoji *Flat* SVG (heart, sparkles, camera, paperclip, coffee, cherry blossom) | 1.1–3.9 KB each | MIT **(measured)** |
| Fluent Emoji *Color* SVG (same set) | 9–44 KB each | gradients make them heavy **(measured)** |
| Fluent Emoji *3D* PNG, 256 px (heart, sparkles) | 22–29 KB each | **(measured)** |
| Twemoji SVG (heart, sparkles, camera, coffee, blossom) | 0.4–3.8 KB each | CC BY 4.0, needs attribution **(measured)** |

A scrapbook page carries many pieces at once (say 6 rings, 3–4 tape strips, 2 clips, 4–6 stickers, a band). As
raster images that is roughly 10–15 files of 20–60 KB, **~300–600 KB** and as many requests, before any photo; drawn
in code it is a few KB of JavaScript that's already in the Theme's bundle. Code also scales cleanly on 2×/3× phone
screens, takes the palette's colours, and can tilt or vary per Stop without new files. **(inferred from the measured
sizes)**

Costs of drawing in code, to keep in mind:

- SVG `feTurbulence`/`feDisplacementMap` filters cost paint time on low-end phones, not bytes. Envelope already applies
  them to small doodles only; keep the binder's filters off large or animated areas (the page background should use
  the pre-baked `GRAIN` tile, not a live filter). **(inferred)**
- Photographic realism (real paper fibres, shiny chrome rings) is harder; the look will be "illustrated scrapbook", the
  same register as Envelope. **(inferred)**

## 3. Sources and licences, if anything isn't drawn by us

Only needed for stickers, and only as a fallback. Checked against each project's own licence file or licence page.

| Source | Licence | Commercial use | Attribution | Fit |
|---|---|---|---|---|
| [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) | MIT ([LICENSE](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE)) | yes | keep the MIT notice with the source (a comment in the file is enough); no on-page credit | **Best fallback.** Flat SVGs are small and tint well |
| [Lucide](https://github.com/lucide-icons/lucide) | ISC ([LICENSE](https://github.com/lucide-icons/lucide/blob/main/LICENSE)) | yes | keep the notice in the source | outline icons (paperclip, heart, camera); too clean for stickers but fine as doodle bases |
| [Phosphor](https://github.com/phosphor-icons/core) | MIT ([LICENSE](https://github.com/phosphor-icons/core/blob/main/LICENSE)) | yes | keep the notice | as Lucide |
| [Tabler Icons](https://github.com/tabler/tabler-icons) | MIT ([LICENSE](https://github.com/tabler/tabler-icons/blob/main/LICENSE)) | yes | keep the notice | as Lucide |
| [Kenney](https://kenney.nl/support) | CC0 (public domain), per its support page | yes | none | game art; little that suits a scrapbook |
| [Noto Emoji](https://github.com/googlefonts/noto-emoji) | images: Apache 2.0; fonts: OFL 1.1; flags: public domain ([README](https://github.com/googlefonts/noto-emoji#license)) | yes | Apache NOTICE with the source | usable, but heavier and rounder than Fluent Flat |
| [Twemoji (jdecked fork)](https://github.com/jdecked/twemoji) | graphics CC BY 4.0 ([LICENSE-GRAPHICS](https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS)) | yes | **required**; the README accepts a footer/About mention or a mention in the HTML/JS source | smallest files, but attribution is an obligation; avoid if Fluent covers it |
| [OpenMoji](https://github.com/hfg-gmuend/openmoji) | **CC BY-SA 4.0** ([LICENSE.txt](https://github.com/hfg-gmuend/openmoji/blob/master/LICENSE.txt)) | yes, but share-alike | required | **avoid**: share-alike on a Paid theme |
| [Unsplash](https://unsplash.com/license) / [Pexels](https://www.pexels.com/license/) / [Pixabay](https://pixabay.com/service/license-summary/) photos (paper, tape, ring textures) | their own licences | yes | not required | **avoid**: all three forbid selling or distributing images without significant change (Unsplash: "Images cannot be sold without significant modification"), and the binder is a Paid theme; heavy too |

## 4. Fonts

### What's already loaded

| Where | Fonts | Loaded on the invite page? |
|---|---|---|
| `src/app/layout.tsx` (root layout, preloaded on **every** route) | **Caveat** 400–700 (`--font-caveat`; latin variable woff2 72.8 KB), **Architects Daughter** 400 (`--font-architects-daughter`, 12.8 KB), **Instrument Sans** (`--font-instrument-sans`, 29.2 KB) | yes, always |
| `src/app/layout.tsx`, `preload: false` | **Fraunces** (soft, opsz), **Courier Prime** 400/700 | only if a page uses them |
| `src/app/globals.css` | `--marker` = Architects Daughter; `--hand` = Caveat → Architects Daughter | (aliases) |
| `envelope/fonts.ts` (applied by `envelope-invite.tsx`) | **Mansalva** (`--env-marker`, 52.4 KB), **Nanum Pen Script** (`--env-pen`, 11.7 KB), **Geist** 400/500 (`--env-print`, 28.6 KB) | only on Envelope Invites |
| `assets/*.ttf` (for link-preview images) | Caveat-Bold, ArchitectsDaughter-Regular, Mansalva-Regular, Geist-Regular | server only |

Sizes are the latin-subset woff2 a phone downloads. **(repo, measured)**

So Caveat and Architects Daughter cost the binder nothing: a Recipient has already downloaded them. Envelope's fonts
add ~93 KB on its pages; the binder should stay at or under that. **(inferred)**

### Candidates (latin woff2, licence from the family's `METADATA.pb` in [google/fonts](https://github.com/google/fonts))

Marker / handwriting labels:

| Font | Size | Licence | Feel |
|---|---|---|---|
| Caveat | 0 (loaded) | OFL | neat handwriting: Stop subtitles, captions, notes |
| Architects Daughter | 0 (loaded) | OFL | print-like hand: small labels |
| **Permanent Marker** | 28.6 KB | Apache 2.0 | Sharpie on tape and polaroid edges: **the marker label face** |
| Gochi Hand | 19.2 KB | OFL | thick felt pen, lighter alternative |
| Reenie Beanie | 17.5 KB | OFL | scrawly pencil |
| Shadows Into Light / Covered By Your Grace / Indie Flower | 15.6 / 15.3 / 18.7 KB | OFL | Kimberly Geswein's casual hands |
| Kalam 400/700 | 13.7 / 12.8 KB | OFL | felt-tip with two weights |
| Mansalva | 52.4 KB | OFL | brush marker; already Envelope's, but the heaviest here |
| Rock Salt | 50.8 KB | Apache 2.0 | rough marker; heavy |

Chunky display title (the cover's big title, each Stop's title):

| Font | Size | Licence | Feel |
|---|---|---|---|
| **Bagel Fat One** | 16.3 KB | OFL | fat, rounded, sticker-letter: **recommended** |
| **Titan One** | 10.5 KB | OFL | heavy rounded sans; lightest option |
| Lilita One | 10.4 KB | OFL | condensed heavy, a little poster-like |
| Chango | 11.8 KB | OFL | very wide and fat |
| Rammetto One | 12.7 KB | OFL | fat with flared corners |
| Dela Gothic One | 13.5 KB | OFL | blocky, Japanese-zine feel |
| Shrikhand | 15.4 KB | OFL | fat italic display |
| Luckiest Guy | 16.7 KB | Apache 2.0 | comic-book caps |
| Chewy | 16.9 KB | Apache 2.0 | bouncy |
| Bowlby One | 21.0 KB | OFL | very heavy grotesque |
| Rubik Bubbles | 40.5 KB | OFL | balloon letters; heavy |

All of the above are in this Next.js version's `next/font/google` data with a `latin` subset (Bagel Fat One, Permanent
Marker, Titan One, Gochi Hand, Lilita One, Reenie Beanie, Kalam checked in
`node_modules/next/dist/compiled/@next/font/dist/google/font-data.json`). OFL 1.1 and Apache 2.0 both allow commercial
use and embedding in a web page. **(docs, measured)**

**Recommended set**: Caveat (subtitles, notes) + Architects Daughter (small labels), both already loaded, plus
**Permanent Marker** (tape and polaroid labels) and **Bagel Fat One** (titles): **+45 KB**, half of what Envelope adds.
Declare them in a `binder/fonts.ts` like Envelope's, applied on the Theme's root element, so only binder Invites download
them. **(inferred)**

### The CSP is fine with `next/font`

- `next/font` self-hosts Google Fonts: "CSS and font files are downloaded at build time and self-hosted with the rest of
  your static assets. **No requests are sent to Google by the browser.**"
  (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md`, line 13; same claim in
  `01-app/01-getting-started/13-fonts.md`, line 96). **(docs)**
- In this repo's build, the `@font-face` rules sit in `/_next/static/chunks/*.css` and point to
  `url(../media/<hash>.woff2)`, i.e. `/_next/static/media/` on our own origin. **(repo, measured)**
- `src/proxy.ts` allows `font-src 'self' data:` and `style-src 'self' 'unsafe-inline'`, so those files load. No CSP
  change is needed. **(repo)**
- A font called in a Theme module (not the root layout) is preloaded only on the routes that render it ("the font is only
  preloaded on the related routes based on the type of file where it is used", `font.md`, *Preloading*). **(docs)**

### Link-preview image

`next/og`'s `ImageResponse` reads only `ttf`, `otf` or `woff` ("Only `ttf`, `otf`, and `woff` font formats are
supported", `04-functions/image-response.md`, line 52). If the binder's preview image uses Bagel Fat One or Permanent
Marker, add their TTFs to `assets/` next to the existing four. The preview image itself is still open on the map. **(docs)**

## Open questions (for the build, not blockers)

- Does the hand-drawn sticker set cover what the owner wants, or do they want emoji-like stickers (then Fluent Flat)?
- Live SVG filters (wobble/deckle) on taped edges: check paint time on a low-end Android at 375 px before applying them
  to many pieces per page.
