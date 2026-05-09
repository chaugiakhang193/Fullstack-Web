import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'nguyenvana',
    description: 'Tên đăng nhập (3–32 ký tự, phải chứa ít nhất 1 chữ cái)',
  })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString({ message: 'Tên đăng nhập không được là một dãy số' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @MaxLength(32, { message: 'Tên đăng nhập tối đa 32 ký tự' })
  @Matches(/.*[a-zA-Z].*/, {
    message:
      'Tên đăng nhập không hợp lệ. Phải chứa ít nhất một chữ cái, không được để toàn số.',
  })
  username: string;

  @ApiProperty({
    example: 'nguyenvana@gmail.com',
    description: 'Địa chỉ email hợp lệ',
  })
  @IsNotEmpty({ message: 'email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Mật khẩu (≥8 ký tự, có chữ hoa, chữ thường và số)',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/(?=.*[A-Z])/, { message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa.' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ thường.',
  })
  @Matches(/(?=.*[0-9])/, { message: 'Mật khẩu phải chứa ít nhất 1 chữ số.' })
  password: string;
}
