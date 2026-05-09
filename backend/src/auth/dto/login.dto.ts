import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'nguyenvana',
    description: 'Tên đăng nhập hoặc email',
  })
  @IsNotEmpty({ message: 'username không được để trống' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'Password123', description: 'Mật khẩu' })
  @IsNotEmpty({ message: 'password không được để trống' })
  @IsString()
  password: string;
}
