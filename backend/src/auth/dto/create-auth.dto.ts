import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

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

  @IsNotEmpty({ message: 'password không được để trống' })
  @Matches(/.*[a-zA-Z].*/, {
    message:
      'password không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.',
  })
  password: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'username không được để trống' })
  @IsString({ message: 'username không được là một dãy số' })
  @Matches(/.*[a-zA-Z].*/, {
    message:
      'username không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.',
  })
  username: string;

  @IsNotEmpty({ message: 'password không được để trống' })
  @Matches(/.*[a-zA-Z].*/, {
    message:
      'password không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.',
  })
  password: string;
}
