import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  @IsString()
  old_password: string;

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
