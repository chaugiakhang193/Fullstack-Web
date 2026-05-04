import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'username không được để trống' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'password không được để trống' })
  @IsString()
  password: string;
}
