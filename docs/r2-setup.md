# Image uploads (Cloudflare R2)

Creators upload the invite picture and plan photos from their device. The browser
shrinks each photo (longest side 1600px, WebP), asks the server for a 5-minute
signed upload URL, and PUTs the file straight to R2. Invites then load it from
`R2_PUBLIC_URL`. Without the settings below, the editor asks for image links instead.

R2's free tier (10 GB storage, 1M uploads and 10M reads a month, free egress)
covers this app comfortably.

## 1. Bucket

Cloudflare dashboard → **R2** → **Create bucket**, e.g. `askherout-images`.

## 2. Public address

Bucket → **Settings** → **Custom Domains** → connect a subdomain you own, e.g.
`img.lornsamnang.com`. (The `r2.dev` address works for testing but is rate-limited
and not cached; use a custom domain in production.)

`R2_PUBLIC_URL` is that address with `https://`, e.g. `https://img.lornsamnang.com`.

## 3. CORS

Bucket → **Settings** → **CORS policy** → paste:

```json
[
  {
    "AllowedOrigins": ["https://askherout.lornsamnang.com", "http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

Add any other origin you test from (e.g. a Cloudflare tunnel URL).

## 4. API token

R2 → **Manage R2 API Tokens** → **Create API token**:
- Permissions: **Object Read & Write**
- Specify bucket: only `askherout-images`

Copy the **Access Key ID** and **Secret Access Key** (shown once). The account ID
is in the R2 overview page (and in the S3 endpoint URL).

## 5. Environment

In `.env.local` and on Vercel (Production and Preview), mark the secret as sensitive:

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=askherout-images
R2_PUBLIC_URL=https://img.lornsamnang.com
```

## 6. Check

```bash
bun run r2:check
```

It runs the browser's CORS preflight from `NEXT_PUBLIC_APP_URL`, uploads a test
file through a signed URL like the app does, reads it back from `R2_PUBLIC_URL`,
and deletes it. Test another origin with `R2_CHECK_ORIGIN=http://localhost:3000 bun run r2:check`.
