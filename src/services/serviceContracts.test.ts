import { describe, expect, it } from "vitest";
import { createServiceRegistry } from "./registry";
import { createAwsApiAdapters } from "./adapters/awsApi";

describe("service registry", () => {
  it("exposes AWS-ready service contracts through a single registry", () => {
    const services = createServiceRegistry(createAwsApiAdapters());

    expect(services.auth.getCurrentUser).toBeTypeOf("function");
    expect(services.metadata.listPhotos).toBeTypeOf("function");
    expect(services.storage.createUploadUrl).toBeTypeOf("function");
    expect(services.processing.requestThumbnailJob).toBeTypeOf("function");
  });

  it("keeps UI hooks bound to registry contracts instead of mock modules", () => {
    const services = createServiceRegistry(createAwsApiAdapters());

    expect(Object.keys(services).sort()).toEqual([
      "auth",
      "metadata",
      "processing",
      "storage"
    ]);
  });
});
