import { UserT } from '@prisma/client';
import { PermissionT } from '../constant/permissions';

export interface TokenPayload {
  id: string;
  userType: UserT;
}

export interface AuthPayload extends TokenPayload {
  roles: string[];
  permissions?: PermissionT[];
  facultyId?: string;
}

// extend interface Request
declare global {
  namespace Express {
    interface Request {
      id?: string;
      requester: AuthPayload;
    }
  }
}

export type ReqWithRequester = Request & {
  id: string;
  requester: AuthPayload;
};
