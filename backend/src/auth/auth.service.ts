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
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const existingUser = await this.usersService.findByUsername(username);

    const isValidPassword =
      existingUser &&
      (await compareHashedDataHelper(password, existingUser.password));

    if (!isValidPassword) {
      throw new BadRequestException(
        'Tài khoản hoặc mật khẩu của bạn không đúng',
      );
    }

    const payload = {
      id: existingUser.id,
      username: existingUser.username,
    };
    return {
      access_token: await this.accessTokenService.signAsync(payload),
      refresh_token: await this.refreshTokenService.signAsync(payload),
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
