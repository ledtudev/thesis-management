import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { ZodValidationPipe } from 'nestjs-zod';
import { generateApiResponse } from 'src/common/response';
import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  LoginByCodeDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './schema';

@ApiTags('Authentication')
@Controller('auth')
@UsePipes(ZodValidationPipe)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/generate-password/:password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate hashed password for testing' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns hashed password',
  })
  generatePassword(@Param('password') password: string) {
    return generateApiResponse('Mật khẩu đã được mã hóa', {
      password: bcrypt.hash(password, 10),
    });
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Universal login for students and faculty' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful and returns tokens',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid login credentials',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found or inactive',
  })
  async login(@Body() dto: LoginByCodeDto) {
    return generateApiResponse(
      'Đăng nhập thành công',
      await this.authService.login(dto),
    );
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refresh successful',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return generateApiResponse(
      'Token đã được làm mới',
      await this.authService.refreshToken(dto),
    );
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout the user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid token',
  })
  async logout(@Body() dto: RefreshTokenDto) {
    return generateApiResponse(
      'Đăng xuất thành công',
      await this.authService.logout(dto.refreshToken),
    );
  }
}
