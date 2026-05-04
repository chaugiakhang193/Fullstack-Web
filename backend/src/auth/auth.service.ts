import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

  // Tạo AccessToken & RefreshToken
  async createTokens(user: any, sessionId: string) {
    // Access Token: Cần Role để làm Guard phân quyền
    const atPayload = {
      sub: user.id,
      username: user.username,
      role: user.role, // Luôn luôn chứa role
    };

    // Refresh Token: Chỉ cần ID và SessionId (Càng nhỏ càng bảo mật)
    const rtPayload = {
      sub: user.id,
      sessionId: sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.accessTokenService.signAsync(atPayload),
      this.refreshTokenService.signAsync(rtPayload),
    ]);

    return { accessToken, refreshToken };
  }

  async handleLogin(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const sessionId = uuidv4();
    const { accessToken, refreshToken } = await this.createTokens(
      payload,
      sessionId,
    );
    // Tính toán thời gian hết hạn của refresh token
    const refreshTokenExpiration = this.configService.get(
      'REFRESH_TOKEN_EXPIRATION',
    );
    const cookie_max_age = ms(refreshTokenExpiration);
    const expiresAt = new Date(Date.now() + cookie_max_age);

    //hash refresh token trước khi lưu vào database
    const hashedRefreshToken = await hashDataHelper(refreshToken);

    // Lưu refresh token và thời gian hết hạn vào cơ sở dữ liệu
    const newSession = this.sessionRepository.create({
      id: sessionId,
      user: user,
      refresh_token: hashedRefreshToken,
      expires_at: expiresAt,
    });
    await this.sessionRepository.save(newSession);

    const { password, ...userWithoutPassword } = user;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      cookie_max_age: cookie_max_age,
      user: userWithoutPassword,
    };
  }

  async handleRefreshToken(userPayload: any, originalRefreshToken: string) {
    //  Tìm Session trực tiếp dựa vào payload, sub là user id
    const session = await this.sessionRepository.findOne({
      where: { id: userPayload.sessionId, user: { id: userPayload.sub } },
      relations: ['user'],
    });

    if (!session) {
      throw new UnauthorizedException(
        'Phiên đăng nhập không tồn tại hoặc đã bị đăng xuất!',
      );
    }

    //check Token xem có hợp lệ không
    const isTokenMatch = await compareHashedDataHelper(
      originalRefreshToken,
      session.refresh_token,
    );
    if (!isTokenMatch) {
      throw new UnauthorizedException(
        'Refresh Token không hợp lệ (Bị đánh cắp hoặc đã xoay vòng)!',
      );
    }

    const newPayload = {
      username: session.user.username,
      sub: session.user.id,
      role: session.user.role,
    };

    const { accessToken, refreshToken } = await this.createTokens(
      newPayload,
      session.id,
    );

    const refreshTokenExpiration = this.configService.get(
      'REFRESH_TOKEN_EXPIRATION',
    );
    const cookie_max_age = ms(refreshTokenExpiration);
    const expiresAt = new Date(Date.now() + cookie_max_age); //tạo thời gian hết hạn refreshtoken mới

    session.refresh_token = await hashDataHelper(refreshToken);
    session.expires_at = expiresAt;

    await this.sessionRepository.save(session);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      cookie_max_age: cookie_max_age,
    };
  }

  async handleLogout(refreshToken: string) {
    if (!refreshToken) return;
    try {
      const payload = await this.refreshTokenService.verifyAsync(refreshToken);
      const sessionId = payload.sessionId;
      if (sessionId) {
        const result = await this.sessionRepository.delete(sessionId);

        if (result.affected === 0) {
          console.log(`Session ${refreshToken} không tồn tại hoặc đã bị xóa.`);
        }
      }
    } catch (error) {
      console.log(
        'Refresh token không hợp lệ hoặc đã hết hạn trong lúc Logout',
      );
    }

    return { message: 'Đăng xuất thành công' };
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
