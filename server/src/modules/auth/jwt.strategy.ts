import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FacultyMemberStatusT, StudentStatusT, UserT } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'src/common/config';
import {
  getPermissionsForRoles,
  RolePermissions,
} from '../../common/constant/permissions';
import { AuthPayload, TokenPayload } from '../../common/interface';
import { PrismaService } from '../../common/modules/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.privateKeySecret,
    });
  }

  async validate(payload: TokenPayload): Promise<AuthPayload> {
    if (!payload?.id || !payload?.userType) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const userType = payload.userType as UserT;

    if (userType === UserT.STUDENT) {
      const student = await this.prisma.student.findUnique({
        where: { id: payload.id, status: StudentStatusT.ACTIVE },
        select: { id: true, status: true, facultyId: true },
      });

      if (!student || student.status !== 'ACTIVE') {
        throw new UnauthorizedException('Student not found or inactive');
      }

      return {
        id: payload.id,
        userType,
        roles: ['STUDENT'],
        permissions: RolePermissions.STUDENT,
        facultyId: student.facultyId || undefined,
      };
    }

    if (userType === UserT.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { id: payload.id, status: FacultyMemberStatusT.ACTIVE },
        select: {
          id: true,
          Role: { select: { role: true } },
          facultyId: true,
          FacultyMembershipDivision: {
            select: {
              role: true,
            },
          },
        },
      });

      if (!faculty) {
        throw new UnauthorizedException('Faculty member not found or inactive');
      }
      const basicRoles = faculty.Role.map((r) => r.role) || [];

      // Check for HEAD role through division membership
      const divisionRoles = faculty.FacultyMembershipDivision.filter(
        (membership) => membership.role === 'HEAD',
      ).map(() => 'HEAD'); // Add HEAD role if user is head of any division

      // Combine all roles and remove duplicates
      const allRoles = [...new Set([...basicRoles, ...divisionRoles])];
      const permissions = getPermissionsForRoles(allRoles);

      return {
        id: payload.id,
        userType,
        roles: allRoles,
        permissions,
        facultyId: faculty?.facultyId || undefined,
      };
    }

    throw new UnauthorizedException('Token không hợp lệ');
  }
}
