import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Mã xác thực không được để trống' })
  @IsString()
  verification_token: string;
}
