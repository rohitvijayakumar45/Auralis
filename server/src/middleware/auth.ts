import { createRemoteJWKSet, jwtVerify } from "jose";
import type { NextFunction, Request, Response } from "express";
import { getConfig } from "../config.js";
import { upsertUserFromClaims } from "../repositories/users.js";

const config = getConfig();
const issuer = `https://cognito-idp.${config.aws.region}.amazonaws.com/${config.aws.cognitoUserPoolId}`;
const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  try {
    const token = request.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      response.status(401).json({ message: "Missing bearer token" });
      return;
    }

    const { payload } = await jwtVerify(token, jwks, { issuer });
    const sub = String(payload.sub ?? "");
    const email = String(payload.email ?? payload.username ?? "");
    const name = String(payload.name ?? email.split("@")[0] ?? "Auralis Member");
    if (!sub || !email) {
      response.status(401).json({ message: "Token missing required claims" });
      return;
    }

    request.user = await upsertUserFromClaims({ sub, email, name });
    next();
  } catch {
    response.status(401).json({ message: "Invalid bearer token" });
  }
}
