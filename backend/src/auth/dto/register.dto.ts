import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'username không được để trống' })
  @IsString({ message: 'username không được là một dãy số' })
  @Matches(/.*[a-zA-Z].*/, {
    message:
      'username không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.',
  })
  username: string;

  @IsNotEmpty({ message: 'email không được để trống' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' }) // Gợi ý thêm
  @Matches(/.*[a-zA-Z].*/, {
    message:
      'Mật khẩu mới không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.',
  })
  password: string;
}
