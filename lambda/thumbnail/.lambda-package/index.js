import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable } from "node:stream";
const s3 = new S3Client({});
const thumbnailsBucket = process.env.THUMBNAILS_BUCKET;
const thumbnailWidth = Number(process.env.THUMBNAIL_WIDTH ?? 720);
async function streamToBuffer(stream) {
    if (!(stream instanceof Readable)) {
        throw new Error("Expected S3 body stream");
    }
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}
function thumbnailKeyFromOriginal(key) {
    return decodeURIComponent(key.replace(/\+/g, " "))
        .replace("/photos/", "/thumbnails/")
        .replace(/\.[^.]+$/, ".webp");
}
export async function handler(event) {
    if (!thumbnailsBucket) {
        throw new Error("THUMBNAILS_BUCKET is required");
    }
    for (const record of event.Records) {
        const sourceBucket = record.s3.bucket.name;
        const sourceKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        if (!sourceKey.includes("/photos/"))
            continue;
        const original = await s3.send(new GetObjectCommand({ Bucket: sourceBucket, Key: sourceKey }));
        const originalBuffer = await streamToBuffer(original.Body);
        const thumbnailBuffer = await sharp(originalBuffer)
            .rotate()
            .resize({ width: thumbnailWidth, withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();
        await s3.send(new PutObjectCommand({
            Bucket: thumbnailsBucket,
            Key: thumbnailKeyFromOriginal(sourceKey),
            Body: thumbnailBuffer,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000, immutable"
        }));
    }
    return { ok: true, processed: event.Records.length };
}
