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
} from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
//DTO
import { RegisterDto } from '@/auth/dto/register.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { VerifyEmailDto } from '@/auth/dto/verify-email.dto';
import { UpdateAuthDto } from '@/auth/dto/update-auth.dto';
import { ResendVerificationEmailDto } from '@/auth/dto/resend-verification-email.dto';

import { Public, ResponseMessage } from '@/decorator/customize';
import type { Response } from 'express';
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
  @ResponseMessage('Đăng ký tài khoản thành công')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(
    'Mã kích hoạt mới đã được gửi. Vui lòng kiểm tra email của bạn.',
  )
  async resendVerification(@Body() resendDto: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(resendDto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
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
