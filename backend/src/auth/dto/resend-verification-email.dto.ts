import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationEmailDto {
  @ApiProperty({
    example: 'nguyenvana@gmail.com',
    description: 'Email cần để gửi lại mã xác nhận',
  })
  @IsNotEmpty({ message: 'Vui lòng nhập email.' })
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email: string;
}
