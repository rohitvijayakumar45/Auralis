import { describe, expect, it } from "vitest";
import { parseConfig } from "./config.js";

describe("server config", () => {
  it("parses required AWS, RDS, and HTTP settings", () => {
    const config = parseConfig({
      NODE_ENV: "test",
      PORT: "4000",
      CLIENT_ORIGIN: "http://127.0.0.1:5180",
      AWS_REGION: "us-east-1",
      COGNITO_USER_POOL_ID: "us-east-1_example",
      COGNITO_APP_CLIENT_ID: "client123",
      S3_ORIGINALS_BUCKET: "originals",
      S3_THUMBNAILS_BUCKET: "thumbs",
      DB_HOST: "db.example.com",
      DB_PORT: "3306",
      DB_USER: "app",
      DB_PASSWORD: "secret",
      DB_NAME: "auralis"
    });

    expect(config.aws.region).toBe("us-east-1");
    expect(config.db.port).toBe(3306);
    expect(config.s3.uploadTtlSeconds).toBe(600);
  });
});
