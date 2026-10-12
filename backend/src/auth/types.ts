import type { Request } from 'express';
export type PublicUser = { id: string; name: string; email: string };
export interface AuthenticatedRequest extends Request {
  user: PublicUser;
}
