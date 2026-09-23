import "server-only";
import { AwsV4Signer } from "aws4fetch";
import { env } from "@/env";

/** True when all R2 settings are present, so uploads can be offered. */
export function isUploadConfigured(): boolean {
  return !!(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET && env.R2_PUBLIC_URL);
}

/**
 * A 5-minute URL the browser can PUT exactly one file to, straight into the
 * R2 bucket, plus the public URL it will be served from afterwards.
 * Content-Type and Content-Length are part of the signature, so R2 rejects an
 * upload of any other type or size than the one we validated.
 */
export async function presignUpload(
  key: string,
  contentType: string,
  size: number,
): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!isUploadConfigured()) throw new Error("R2 is not configured");

  const url = new URL(`https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${key}`);
  url.searchParams.set("X-Amz-Expires", "300");

  const signer = new AwsV4Signer({
    url: url.toString(),
    method: "PUT",
    headers: { "content-type": contentType, "content-length": String(size) },
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    service: "s3",
    region: "auto",
    signQuery: true,
    // Sign content-type/length too (aws4fetch skips them by default).
    allHeaders: true,
  });
  const signed = await signer.sign();

  return {
    uploadUrl: signed.url.toString(),
    publicUrl: `${env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`,
  };
}
