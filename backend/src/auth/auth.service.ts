import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
//DTO
import { RegisterDto } from '@/auth/dto/register.dto';
import { UpdateAuthDto } from '@/auth/dto/update-auth.dto';
import { ResendVerificationEmailDto } from '@/auth/dto/resend-verification-email.dto';

import { UsersService } from '@/modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@/modules/mail/mail.service';

//typeorm
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Session } from '@/auth/entities/session.entity';
import { VerificationToken } from '@/auth/entities/verification-token.entity';
import { User } from '@/modules/users/entities/user.entity';

//helpers
import { compareHashedDataHelper, hashDataHelper } from '@/helpers/ultis';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { VerificationTokenType, AccountStatus } from '@/modules/enums';

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
    @InjectDataSource() private dataSource: DataSource,
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService,
    @Inject(ACCESS_TOKEN_SERVICE) private accessTokenService: JwtService,
    @Inject(REFRESH_TOKEN_SERVICE) private refreshTokenService: JwtService,
  ) {}

  //[POST] /auth/register
  async register(RegisterDto: RegisterDto) {
    //tạo mới người dùng
    const newUser = await this.usersService.create(RegisterDto);

    await this.generateAndSendVerificationEmail(newUser);
  }

  // [POST] auth/resend-verification
  async resendVerificationEmail(resendDto: ResendVerificationEmailDto) {
    const { email } = resendDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại trong hệ thống.');
    }

    //kiểm tra xem tài khoản đã kích hoạt từ trước chưa
    if (user.status === AccountStatus.ACTIVE) {
      throw new BadRequestException(
        'Tài khoản này đã được kích hoạt. Vui lòng đăng nhập.',
      );
    }

    //Xóa tất cả các token đã hết hạn, và chỉ xóa token dùng để Verify Email
    await this.verificationTokenRepository.delete({
      user: { id: user.id },
      type: VerificationTokenType.VERIFY_EMAIL,
    });

    await this.generateAndSendVerificationEmail(user);
  }

  // [POST] auth/verify-email
  async verifyEmailAndActivateUser(verification_token_from_user: string) {
    //Tạo transaction từ DataSource
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //dựa trên token user cấp rồi tìm trong database xem có tồn tại token này không
      const verificationToken = await queryRunner.manager.findOne(
        VerificationToken,
        {
          where: { token: verification_token_from_user },
          relations: ['user'],
        },
      );

      // Check sự tồn tại của token
      if (!verificationToken) {
        throw new BadRequestException(
          'Mã xác thực không hợp lệ hoặc đã được sử dụng.',
        );
      }

      if (verificationToken.expires_at < new Date()) {
        throw new BadRequestException('Mã xác thực đã hết hạn.');
      }

      const user = verificationToken.user;

      // Tránh trường hợp bấm double-click hoặc verify lại
      if (user.status === 'active') {
        throw new BadRequestException(
          'Tài khoản này đã được kích hoạt từ trước.',
        );
      }

      // nhật trạng thái User thành 'active'
      user.status = AccountStatus.ACTIVE;
      await queryRunner.manager.save(User, user); // Lệnh UPDATE

      // Xóa Verification Token đã sử dụng
      await queryRunner.manager.remove(VerificationToken, verificationToken); // Lệnh DELETE

      // commit khi 2 lệnh chạy trong database trên đều thành công
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Hệ thống gặp sự cố khi xác thực, vui lòng thử lại.',
      );
    } finally {
      await queryRunner.release();
    }
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

  // [POST] auth/login
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

  // [POST] auth/refresh
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

  // [POST] auth/logout
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

  //Helpers
  // Tạo AccessToken & RefreshToken
  private async createTokens(user: any, sessionId: string) {
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

  private async generateAndSendVerificationEmail(user: User) {
    //tạo token xác thực tài khoản và gửi email cho người dùng
    const token = uuidv4();
    const tokenExpiration = new Date(Date.now() + 5 * 60 * 1000);
    const newVerificationToken = this.verificationTokenRepository.create({
      user: user,
      token: token,
      type: VerificationTokenType.VERIFY_EMAIL,
      expires_at: tokenExpiration,
    });
    await this.verificationTokenRepository.save(newVerificationToken);

    //gửi email xác thực tài khoản
    await this.mailService.sendVerifacationEmail(user, token);
  }
}
