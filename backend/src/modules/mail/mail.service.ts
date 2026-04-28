// src/modules/mail/mail.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  //Gửi email token để người dùng xác thực tài khoản sau khi đăng ký
  async sendVerifacationEmail(user: any, verificationToken: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Chào mừng ${user.username}! Hãy xác thực tài khoản của bạn`,
        template: 'register',
        context: {
          name: user.username,
          verificationToken: verificationToken,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
