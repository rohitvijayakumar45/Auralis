import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { getConfig } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { photosRouter } from "./routes/photos.js";

export function createApp() {
  const config = getConfig();
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: false }));
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

  app.get("/health", (_request, response) => {
    response.json({ ok: true, service: "auralis-api" });
  });
  app.use("/auth", authRouter);
  app.use("/", photosRouter);

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction
    ) => {
      void _next;
      if (error instanceof ZodError) {
        const issuesMessage = error.issues.map(i => i.message).join(" ");
        response.status(400).json({ message: issuesMessage, issues: error.issues });
        return;
      }
      const message = error instanceof Error ? error.message : "Unexpected server error";
      response.status(500).json({ message });
    }
  );

  return app;
}
