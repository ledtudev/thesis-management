import { SetMetadata } from '@nestjs/common';
import { PermissionT } from '../constant/permissions';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionT[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
