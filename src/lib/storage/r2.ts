import "server-only";
import { AwsClient } from "aws4fetch";
import { env } from "@/env";

/** True when all R2 settings are present, so uploads can be offered. */
export function isUploadConfigured(): boolean {
  return !!(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET && env.R2_PUBLIC_URL);
}

/**
 * A short-lived URL the browser can PUT one file to, straight into the R2
 * bucket, plus the public URL it will be served from afterwards.
 */
export async function presignUpload(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!isUploadConfigured()) throw new Error("R2 is not configured");
  const client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
  });

  const url = new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`);
  url.searchParams.set("X-Amz-Expires", "300");
  const signed = await client.sign(new Request(url, { method: "PUT", headers: { "Content-Type": contentType } }), {
    aws: { signQuery: true },
  });

  return {
    uploadUrl: signed.url,
    publicUrl: `${env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`,
  };
}
