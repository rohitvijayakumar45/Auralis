/* eslint-disable @typescript-eslint/no-namespace */
export type AuthenticatedUser = {
  sub: string;
  email: string;
  name: string;
  userId: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
