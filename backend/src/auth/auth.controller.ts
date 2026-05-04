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
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
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
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    await this.authService.handleLogout(refreshToken);

    clearRefreshTokenCookie(res);

    return {
      statusCode: HttpStatus.OK,
      message: 'Đăng xuất thành công, đã xóa phiên làm việc!',
    };
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
