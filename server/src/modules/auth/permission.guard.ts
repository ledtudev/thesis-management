import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PermissionT,
  getPermissionsForRoles,
} from '../../common/constant/permissions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.get<PermissionT[]>('permissions', context.getHandler()) ||
      [];

    // if route does not require specific permission, allow access
    if (requiredPermissions.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user?.roles?.length) {
      throw new ForbiddenException('Tài khoản không có quyền truy cập');
    }

    const userPermissions: PermissionT[] = Array.isArray(user.permissions)
      ? user.permissions
      : getPermissionsForRoles(user.roles);

    const hasAllPermissions = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Tài khoản không có quyền truy cập');
    }

    return true;
  }
}
