// Checks the R2 setup end to end, the way the invite editor uses it:
//   1. the browser's CORS preflight from the site is allowed,
//   2. a query-signed PUT (like the one the app hands out) is accepted,
//   3. the file is readable at R2_PUBLIC_URL,
// then deletes the test file.
//
//   bun run r2:check        (bun loads .env.local automatically)
//
// Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
// R2_PUBLIC_URL, and NEXT_PUBLIC_APP_URL (the origin allowed by CORS; override
// with R2_CHECK_ORIGIN to test another one, e.g. http://localhost:3000).

import { AwsClient, AwsV4Signer } from "aws4fetch";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
const origin = process.env.R2_CHECK_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL;

const missing = Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL })
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);
if (!origin) throw new Error("Set NEXT_PUBLIC_APP_URL or R2_CHECK_ORIGIN");

const key = `_check/${Date.now()}.txt`;
const objectUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`;
const publicUrl = `${R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
const body = `ask her out r2 check ${new Date().toISOString()}`;
let failed = false;

function report(ok: boolean, label: string, detail = "") {
  if (!ok) failed = true;
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` (${detail})` : ""}`);
}

// 1. CORS preflight, as the browser sends it before the upload.
const preflight = await fetch(objectUrl, {
  method: "OPTIONS",
  headers: { Origin: origin, "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type" },
});
const allowed = preflight.headers.get("access-control-allow-origin");
report(preflight.ok && (allowed === origin || allowed === "*"), `CORS allows PUT from ${origin}`, `HTTP ${preflight.status}, allow-origin: ${allowed ?? "none"}`);

// 2. Upload through a query-signed URL, signed like src/lib/storage/r2.ts does.
const url = new URL(objectUrl);
url.searchParams.set("X-Amz-Expires", "300");
const signed = await new AwsV4Signer({
  url: url.toString(),
  method: "PUT",
  headers: { "content-type": "text/plain", "content-length": String(Buffer.byteLength(body)) },
  accessKeyId: R2_ACCESS_KEY_ID!,
  secretAccessKey: R2_SECRET_ACCESS_KEY!,
  service: "s3",
  region: "auto",
  signQuery: true,
  allHeaders: true,
}).sign();
const put = await fetch(signed.url, { method: "PUT", headers: { "content-type": "text/plain", Origin: origin }, body });
report(put.ok, "Signed upload accepted", `HTTP ${put.status}${put.ok ? "" : `: ${(await put.text()).slice(0, 200)}`}`);

// 3. Public read.
if (put.ok) {
  const read = await fetch(publicUrl, { cache: "no-store" });
  const text = read.ok ? await read.text() : "";
  report(read.ok && text === body, `Readable at ${R2_PUBLIC_URL}`, `HTTP ${read.status}`);

  // Clean up.
  const client = new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY!, service: "s3", region: "auto" });
  const del = await client.fetch(objectUrl, { method: "DELETE" });
  report(del.ok, "Test file deleted", `HTTP ${del.status}`);
}

console.log(failed ? "\nSomething's off: see docs/r2-setup.md." : "\nR2 is ready. Uploads will appear in the invite editor once these env vars are on Vercel too.");
process.exit(failed ? 1 : 0);
