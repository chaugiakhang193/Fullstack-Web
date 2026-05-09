import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Mã token khôi phục mật khẩu nhận được từ email',
  })
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123', description: 'Mật khẩu mới' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa.',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Mật khẩu mới phải chứa ít nhất 1 chữ thường.',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Mật khẩu mới phải chứa ít nhất 1 chữ số.',
  })
  new_password: string;
}
