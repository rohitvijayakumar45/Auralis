import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://127.0.0.1:5180"),
  AWS_REGION: z.string().min(1),
  COGNITO_USER_POOL_ID: z.string().min(1),
  COGNITO_APP_CLIENT_ID: z.string().min(1),
  S3_ORIGINALS_BUCKET: z.string().min(1),
  S3_THUMBNAILS_BUCKET: z.string().min(1),
  UPLOAD_URL_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  DOWNLOAD_URL_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1)
});

export function parseConfig(env: NodeJS.ProcessEnv) {
  const parsed = envSchema.parse(env);
  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    clientOrigin: parsed.CLIENT_ORIGIN,
    aws: {
      region: parsed.AWS_REGION,
      cognitoUserPoolId: parsed.COGNITO_USER_POOL_ID,
      cognitoAppClientId: parsed.COGNITO_APP_CLIENT_ID
    },
    s3: {
      originalsBucket: parsed.S3_ORIGINALS_BUCKET,
      thumbnailsBucket: parsed.S3_THUMBNAILS_BUCKET,
      uploadTtlSeconds: parsed.UPLOAD_URL_TTL_SECONDS,
      downloadTtlSeconds: parsed.DOWNLOAD_URL_TTL_SECONDS
    },
    db: {
      host: parsed.DB_HOST,
      port: parsed.DB_PORT,
      user: parsed.DB_USER,
      password: parsed.DB_PASSWORD,
      database: parsed.DB_NAME
    }
  };
}

export type AppConfig = ReturnType<typeof parseConfig>;

let cachedConfig: AppConfig | undefined;

export function getConfig() {
  cachedConfig ??= parseConfig(process.env);
  return cachedConfig;
}
