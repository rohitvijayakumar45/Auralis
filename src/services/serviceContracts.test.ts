import { describe, expect, it } from "vitest";
import { createServiceRegistry } from "./registry";
import { createMockServiceAdapters } from "./adapters/mock";

describe("service registry", () => {
  it("exposes AWS-ready service contracts through a single registry", async () => {
    const services = createServiceRegistry(createMockServiceAdapters());

    await expect(services.auth.getCurrentUser()).resolves.toMatchObject({
      id: expect.any(String),
      email: expect.stringContaining("@")
    });

    await expect(
      services.metadata.listPhotos({
        query: "alpine",
        filter: "all",
        sort: "newest",
        view: "grid"
      })
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          storageKey: expect.stringContaining("photos/"),
          thumbnailKey: expect.stringContaining("thumbnails/")
        })
      ])
    );

    expect(services.storage.createUploadUrl).toBeTypeOf("function");
    expect(services.processing.requestThumbnailJob).toBeTypeOf("function");
  });

  it("keeps UI hooks bound to registry contracts instead of mock modules", () => {
    const services = createServiceRegistry(createMockServiceAdapters());

    expect(Object.keys(services).sort()).toEqual([
      "auth",
      "metadata",
      "processing",
      "storage"
    ]);
  });
});
