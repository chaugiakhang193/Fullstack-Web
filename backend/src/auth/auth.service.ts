import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RegisterDto, LoginDto } from '@/auth/dto/create-auth.dto';
import { UpdateAuthDto } from '@/auth/dto/update-auth.dto';

import { UsersService } from '@/modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@/modules/mail/mail.service';

//typeorm
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '@/auth/entities/session.entity';
import { VerificationToken } from '@/auth/entities/verification-token.entity';

//helpers
import { compareHashedDataHelper, hashDataHelper } from '@/helpers/ultis';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { VerificationTokenType } from '@/modules/enums';

//JWT
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_SERVICE } from './auth.constants';
import { ACCESS_TOKEN_SERVICE } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(VerificationToken)
    private verificationTokenRepository: Repository<VerificationToken>,
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService,
    @Inject(ACCESS_TOKEN_SERVICE) private accessTokenService: JwtService,
    @Inject(REFRESH_TOKEN_SERVICE) private refreshTokenService: JwtService,
  ) {}

  async register(RegisterDto: RegisterDto) {
    //tạo mới người dùng
    const newUser = await this.usersService.create(RegisterDto);

    //tạo token xác thực tài khoản và gửi email cho người dùng
    const token = uuidv4();
    const tokenExpiration = new Date(Date.now() + 5 * 60 * 1000);
    const newVerificationToken = this.verificationTokenRepository.create({
      user: newUser,
      token: token,
      type: VerificationTokenType.VERIFY_EMAIL,
      expires_at: tokenExpiration,
    });
    await this.verificationTokenRepository.save(newVerificationToken);

    //gửi email xác thực tài khoản
    await this.mailService.sendVerifacationEmail(newUser, token);
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

    const accessToken = this.accessTokenService.sign(payload);
    const refreshToken = this.refreshTokenService.sign(payload);

    // Tính toán thời gian hết hạn của refresh token
    const refreshTokenExpiration = this.configService.get(
      'REFRESH_TOKEN_EXPIRATION',
    );
    const expiresAt = new Date(Date.now() + ms(refreshTokenExpiration));

    //hash refresh token trước khi lưu vào database
    const hashedRefreshToken = await hashDataHelper(refreshToken);

    // Lưu refresh token và thời gian hết hạn vào cơ sở dữ liệu
    const newSession = this.sessionRepository.create({
      user: user,
      refresh_token: hashedRefreshToken,
      expires_at: expiresAt,
    });
    await this.sessionRepository.save(newSession);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
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
