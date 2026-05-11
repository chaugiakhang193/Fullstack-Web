import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';

export class UserResponseDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'Mã ID của người dùng',
  })
  _id: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...',
    description: 'JWT Access Token dùng để gọi các API yêu cầu xác thực',
  })
  access_token: string;

  @ApiProperty({
    description: 'Thông tin người dùng (đã ẩn mật khẩu)',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}

export class UnverifiedAccountResponseDto {
  @ApiProperty({
    example: 401,
    description: 'Mã trạng thái HTTP',
  })
  statusCode: number;

  @ApiProperty({
    example:
      'Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn để kích hoạt.',
    description: 'Thông báo lỗi chi tiết',
  })
  message: string;

  @ApiProperty({
    example: 'Unauthorized',
    description: 'Loại lỗi xác thực',
  })
  error: string;
}
