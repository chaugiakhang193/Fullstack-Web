import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from '@/auth/auth.service';

//DTO
import { RegisterDto } from '@/auth/dto/register.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { VerifyEmailDto } from '@/auth/dto/verify-email.dto';
import { UpdateAuthDto } from '@/auth/dto/update-auth.dto';
import { ResendVerificationEmailDto } from '@/auth/dto/resend-verification-email.dto';
import { ChangePasswordDto } from '@/auth/dto/change-password.dto';

import { Public, ResponseMessage } from '@/decorator/customize';

//rate limit
import { Throttle, SkipThrottle } from '@nestjs/throttler';

//Guards
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RefreshTokenGuard } from './guard/jwt-refresh-auth.guard';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '@/helpers/cookie.helper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @ResponseMessage('Đăng ký tài khoản thành công')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @ResponseMessage(
    'Mã kích hoạt mới đã được gửi. Vui lòng kiểm tra email của bạn.',
  )
  async resendVerification(@Body() resendDto: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(resendDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @ResponseMessage(
    'Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.',
  )
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmailAndActivateUser(
      verifyEmailDto.verification_token,
    );
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ResponseMessage('Đăng nhập thành công')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token, cookie_max_age, user } =
      await this.authService.handleLogin(req.user);

    // Set refresh cookie vào cookie với HTTP only
    setRefreshTokenCookie(res, refresh_token, cookie_max_age);

    return {
      access_token,
      user,
    };
  }

  @Put('change-password')
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @ResponseMessage('Đã đổi mật khẩu thành công và đăng xuất khỏi mọi thiết bị')
  async changePassword(
    @Req() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // req.user được bóc ra từ JWT payload bởi Passport Strategy
    const userId = req.user.sub;
    return await this.authService.changePassword(userId, changePasswordDto);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshTokens(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userPayload = req.user;

    const refreshToken = req.cookies['refresh_token'];
    const { access_token, refresh_token, cookie_max_age } =
      await this.authService.handleRefreshToken(userPayload, refreshToken);

    setRefreshTokenCookie(res, refresh_token, cookie_max_age);

    return { access_token: access_token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Đăng xuất thành công, đã xóa phiên làm việc!')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    await this.authService.handleLogout(refreshToken);

    clearRefreshTokenCookie(res);
  }

  @Post()
  create(@Body() createAuthDto: RegisterDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
