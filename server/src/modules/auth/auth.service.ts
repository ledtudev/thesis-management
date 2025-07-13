import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserT } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { config } from 'src/common/config';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { FacultyService } from '../user/faculty/faculty.service';
import { StudentService } from '../user/student/student.service';
import { LoginByCodeDto, RefreshTokenDto } from './schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly studentService: StudentService,
    private readonly facultyService: FacultyService,
  ) {}

  async login(dto: LoginByCodeDto) {
    const { code, password, userType } = dto;

    const user =
      userType === UserT.FACULTY
        ? await this.facultyService.authenticate(code, password)
        : await this.studentService.authenticate(code, password);

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    const roles =
      userType === UserT.FACULTY
        ? (user as any)?.FacultyRoles?.map((r) => r.role) || []
        : ['STUDENT'];

    const payload = { id: user.id, userType };

    const accessTokenExpiresIn = 3600; // 1 hour in seconds
    const refreshTokenExpiresIn = 604800; // 7 days in seconds

    const accessToken = this.jwtService.sign(payload, {
      secret: config.privateKeySecret,
      expiresIn: `${accessTokenExpiresIn}s`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: config.refreshKeySecret,
      expiresIn: `${refreshTokenExpiresIn}s`,
    });

    if (userType === UserT.FACULTY) {
      await this.facultyService.updateRefreshToken(user.id, refreshToken);
    } else {
      await this.studentService.updateRefreshToken(user.id, refreshToken);
    }

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
      user
    };
  }


  private async validateRefreshToken(
    refreshToken: string,
    requireValidHash = true,
  ) {
    // Verify token and extract payload
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: config.refreshKeySecret,
      });
    } catch (error) {
      throw new UnauthorizedException(
        error.name === 'TokenExpiredError'
          ? 'Token hết hạn'
          : 'Token không hợp lệ',
      );
    }

    // Validate payload contents
    if (!payload.id || !payload.userType) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    // Get user from database based on user type
    const user =
      payload.userType === UserT.FACULTY
        ? await this.facultyService.get(payload.id)
        : await this.studentService.get(payload.id);

    // Verify user exists and has refresh token
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException(
        'Tài khoản không tồn tại hoặc không có token làm mới',
      );
    }

    // Optionally verify stored hash matches provided token
    if (requireValidHash) {
      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Mã hóa token không chính xác');
      }
    }

    // Get user roles
    const roles =
      payload.userType === UserT.FACULTY
        ? (user as any)?.FacultyRoles?.map((r) => r.role) || []
        : ['STUDENT'];

    return { payload, user, roles };
  }

  async refreshToken(dto: RefreshTokenDto) {
    // Validate refresh token and get user info
    const { payload, user, roles } = await this.validateRefreshToken(
      dto.refreshToken,
    );

    // Create clean payload without exp property
    const newPayload = {
      id: payload.id,
      userType: payload.userType,
    };

    const accessTokenExpiresIn = 300; // 5 minutes in seconds
    const refreshTokenExpiresIn = 604800; // 7 days in seconds

    // Generate new access token
    const accessToken = this.jwtService.sign(newPayload, {
      secret: config.privateKeySecret,
      expiresIn: `${accessTokenExpiresIn}s`,
    });

    // Generate new refresh token
    const newRefreshToken = this.jwtService.sign(newPayload, {
      secret: config.refreshKeySecret,
      expiresIn: `${refreshTokenExpiresIn}s`,
    });

    // Update refresh token in database
    if (payload.userType === UserT.FACULTY) {
      await this.facultyService.updateRefreshToken(user.id, newRefreshToken);
    } else {
      await this.studentService.updateRefreshToken(user.id, newRefreshToken);
    }

    // Return new tokens
    return {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
      roles,
    };
  }

  async logout(refreshToken: string) {
    // Check if token exists
    if (!refreshToken) {
      throw new UnauthorizedException('Không có token làm mới được cung cấp');
    }

    // Validate token
    const { payload } = await this.validateRefreshToken(refreshToken, false);

    // Clear refresh token in database
    if (payload.userType === UserT.FACULTY) {
      await this.prisma.facultyMember.update({
        where: { id: payload.id },
        data: { refreshToken: null },
      });
    } else {
      await this.prisma.student.update({
        where: { id: payload.id },
        data: { refreshToken: null },
      });
    }

    return { success: true };
  }
}
