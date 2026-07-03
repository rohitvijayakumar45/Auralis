import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { Router } from "express";
import { z } from "zod";
import { getConfig } from "../config.js";
import { requireAuth } from "../middleware/auth.js";
import { getUserProfile, getUserSettings, updateUserSettings } from "../repositories/users.js";

const config = getConfig();
const cognito = new CognitoIdentityProviderClient({ region: config.aws.region });
export const authRouter = Router();

authRouter.post("/signup", async (request, response, next) => {
  try {
    const body = z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8)
      })
      .parse(request.body);

    await cognito.send(
      new SignUpCommand({
        ClientId: config.aws.cognitoAppClientId,
        Username: body.email,
        Password: body.password,
        UserAttributes: [
          { Name: "email", Value: body.email },
          { Name: "name", Value: body.name }
        ]
      })
    );

    response.status(202).json({
      message: "Signup accepted. Confirm the Cognito user before login."
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const body = z
      .object({ email: z.string().email(), password: z.string().min(1) })
      .parse(request.body);
    const result = await cognito.send(
      new InitiateAuthCommand({
        ClientId: config.aws.cognitoAppClientId,
        AuthFlow: "USER_PASSWORD_AUTH",
        AuthParameters: {
          USERNAME: body.email,
          PASSWORD: body.password
        }
      })
    );
    response.json(result.AuthenticationResult);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (request, response, next) => {
  try {
    const body = z.object({ refreshToken: z.string().min(1) }).parse(request.body);
    const result = await cognito.send(
      new InitiateAuthCommand({
        ClientId: config.aws.cognitoAppClientId,
        AuthFlow: "REFRESH_TOKEN_AUTH",
        AuthParameters: {
          REFRESH_TOKEN: body.refreshToken
        }
      })
    );
    response.json(result.AuthenticationResult);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (request, response, next) => {
  try {
    const profile = await getUserProfile(request.user!.userId);
    response.json(profile);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/settings", requireAuth, async (request, response, next) => {
  try {
    const settings = await getUserSettings(request.user!.userId);
    response.json(settings);
  } catch (error) {
    next(error);
  }
});

authRouter.patch("/settings", requireAuth, async (request, response, next) => {
  try {
    const settings = await updateUserSettings(request.user!.userId, request.body);
    response.json(settings);
  } catch (error) {
    next(error);
  }
});

