import { describe, expect, it } from "vitest";
import { buildPhotoStorageKey, buildThumbnailStorageKey } from "./keyBuilder.js";

describe("S3 key builder", () => {
  it("scopes original and thumbnail keys by user and generated asset id", () => {
    const original = buildPhotoStorageKey("user-1", "Summer Table.JPG", "asset-1");
    const thumbnail = buildThumbnailStorageKey("user-1", "asset-1");

    expect(original).toBe("users/user-1/photos/asset-1-summer-table.jpg");
    expect(thumbnail).toBe("users/user-1/thumbnails/asset-1.webp");
  });
});
