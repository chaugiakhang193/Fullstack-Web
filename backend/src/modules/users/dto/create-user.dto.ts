import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { UserRole, AccountStatus } from '@/modules/enums';

export class CreateUserDto {
  @IsNotEmpty({ message: 'username không được để trống' })
  @IsString({ message: 'username không được là một dãy số' })
  username: string;

  @IsNotEmpty({ message: 'email không được để trống' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'password không được để trống' })
  password: string;

  @IsEnum(UserRole, { message: 'role không hợp lệ' })
  role: UserRole;

  @IsEnum(AccountStatus, { message: 'account status không hợp lệ' })
  status: AccountStatus;

  @IsOptional()
  @IsString({ message: 'full_name phải là một chuỗi' })
  full_name: string;

  @IsOptional()
  @IsPhoneNumber()
  phone: string;
}
