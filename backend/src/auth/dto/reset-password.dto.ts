import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }) // Gợi ý thêm
  @Matches(/.*[a-zA-Z].*/, {
    message:
      'Mật khẩu mới không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.',
  })
  new_password: string;
}
