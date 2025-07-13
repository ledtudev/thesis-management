import { SetMetadata } from '@nestjs/common';
import { PermissionT } from '../../common/constant/permissions';

export const RequirePermissions = (...permissions: PermissionT[]) =>
  SetMetadata('permissions', permissions);
