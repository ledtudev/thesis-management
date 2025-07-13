import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FacultyMemberStatusT, StudentStatusT, UserT } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'src/common/config';
import { getPermissionsForRoles } from 'src/common/constant/permissions';
import { AuthPayload, TokenPayload } from 'src/common/interface';
import { PrismaService } from '../../common/modules/prisma/prisma.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.refreshKeySecret,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: TokenPayload): Promise<AuthPayload> {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }

    if (!payload?.id || !payload?.userType) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const userType = payload.userType as UserT;

    const user =
      userType === UserT.STUDENT
        ? await this.prisma.student.findUnique({
            where: { id: payload.id, status: StudentStatusT.ACTIVE },
            select: { id: true, refreshToken: true },
          })
        : userType === UserT.FACULTY
          ? await this.prisma.facultyMember.findUnique({
              where: { id: payload.id, status: FacultyMemberStatusT.ACTIVE },
              select: {
                id: true,
                refreshToken: true,
                Role: { select: { role: true } },
                facultyId: true,
                FacultyMembershipDivision: {
                  select: {
                    role: true,
                    Division: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            })
          : null;

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        'Không tìm thấy tài khoản hoặc refresh token không tồn tại',
      );
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    // Calculate roles based on user type
    let roles: string[] = [];

    if (userType === UserT.FACULTY) {
      const facultyUser = user as any;

      // Get roles from FacultyRole table
      const basicRoles = facultyUser.Role?.map((r: any) => r.role) || [];

      // Check for HEAD role through division membership
      const divisionRoles =
        facultyUser.FacultyMembershipDivision?.filter(
          (membership: any) => membership.role === 'HEAD',
        ).map(() => 'HEAD') || []; // Add HEAD role if user is head of any division

      // Combine all roles and remove duplicates
      roles = [...new Set([...basicRoles, ...divisionRoles])];
    } else {
      roles = ['STUDENT'];
    }

    const permissions = getPermissionsForRoles(roles);

    return {
      id: user.id,
      userType,
      roles,
      permissions,
      facultyId:
        userType === UserT.FACULTY ? (user as any)?.facultyId : undefined,
    };
  }
}
