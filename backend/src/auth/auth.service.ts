import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '@/modules/users/users.service';
import { compareHashedDataHelper } from '@/helpers/ultis';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_SERVICE } from './auth.constants';
import { ACCESS_TOKEN_SERVICE } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @Inject(ACCESS_TOKEN_SERVICE) private accessTokenService: JwtService,
    @Inject(REFRESH_TOKEN_SERVICE) private refreshTokenService: JwtService,
  ) {}

  register(RegisterDto: RegisterDto) {
    return this.usersService.handleRegister(RegisterDto);
  }

  // được gọi trong LocalStrategy để xác thực tài khoản khi đăng nhập
  async validateUser(username: string, password: string): Promise<any> {
    const existingUser = await this.usersService.findByUsername(username);

    const isValidPassword =
      existingUser &&
      (await compareHashedDataHelper(password, existingUser.password));

    if (!isValidPassword) {
      return null;
      /* throw new BadRequestException(
        'Tài khoản hoặc mật khẩu của bạn không đúng',
      ); */
    }
    const { password: _, ...userWithoutPassword } = existingUser;
    return userWithoutPassword;
  }

  async handleLogin(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.accessTokenService.sign(payload),
      refresh_token: this.refreshTokenService.sign(payload),
    };
  }

  create(createAuthDto: RegisterDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
