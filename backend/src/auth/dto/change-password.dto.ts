import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  @IsString()
  old_password: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }) // Gợi ý thêm
  @Matches(/.*[a-zA-Z].*/, {
    message:
      'Mật khẩu mới không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.',
  })
  new_password: string;
}
