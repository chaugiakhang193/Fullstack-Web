import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Mã xác thực từ email',
  })
  @IsNotEmpty({ message: 'Mã xác thực không được để trống' })
  @IsString()
  verification_token: string;
}
