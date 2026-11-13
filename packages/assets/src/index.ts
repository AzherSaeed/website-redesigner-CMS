import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import path from "node:path";
import type { AssetMap, RawScrape } from "@wr/schema";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80";

// Backblaze B2 via its S3-compatible API.
// Required env: B2_BUCKET, B2_ENDPOINT (e.g. https://s3.us-west-004.backblazeb2.com),
// B2_REGION (e.g. us-west-004), B2_KEY_ID, B2_APPLICATION_KEY.
// Optional: B2_PUBLIC_BASE_URL (custom domain or friendly-URL host). If unset,
// falls back to the standard f000-style B2 public URL.
const bucket = process.env.B2_BUCKET;
const endpoint = process.env.B2_ENDPOINT;
const region = process.env.B2_REGION;
const publicBase = process.env.B2_PUBLIC_BASE_URL;

const b2 =
  bucket && endpoint && region && process.env.B2_KEY_ID && process.env.B2_APPLICATION_KEY
    ? new S3Client({
        endpoint,
        region,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.B2_KEY_ID,
          secretAccessKey: process.env.B2_APPLICATION_KEY,
        },
      })
    : null;

function publicUrl(key: string): string {
  if (publicBase) return `${publicBase.replace(/\/$/, "")}/${key}`;
  // Default B2 friendly URL: https://<endpoint-host>/file/<bucket>/<key>
  const host = new URL(endpoint!).host;
  return `https://${host}/file/${bucket}/${key}`;
}

async function rehostOne(src: string): Promise<string> {
  try {
    const res = await fetch(src);
    if (!res.ok) return src;
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = path.extname(new URL(src).pathname).slice(1) || "jpg";
    const key = `assets/${createHash("sha1").update(buf).digest("hex")}.${ext}`;

    if (b2 && bucket) {
      await b2.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buf,
          ContentType: res.headers.get("content-type") ?? `image/${ext}`,
        }),
      );
      return publicUrl(key);
    }
    return src; // no store configured: keep source URL (dev fallback)
  } catch {
    return src;
  }
}

export async function rehost(raw: RawScrape): Promise<AssetMap> {
  const logoSrc = raw.logoCandidates[0];
  const nonLogo = raw.images.filter((i) => !raw.logoCandidates.includes(i.src));
  const [hero, about, ...rest] = nonLogo;

  const [logo, heroImage, aboutImage, ...serviceImages] = await Promise.all([
    logoSrc ? rehostOne(logoSrc) : Promise.resolve<string | undefined>(undefined),
    hero ? rehostOne(hero.src) : Promise.resolve<string | undefined>(PLACEHOLDER),
    about ? rehostOne(about.src) : Promise.resolve<string | undefined>(undefined),
    ...rest.slice(0, 4).map((i) => rehostOne(i.src)),
  ]);

  return {
    logo,
    heroImage,
    aboutImage,
    serviceImages: serviceImages.filter(Boolean) as string[],
  };
}
