import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { User } from '@/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hashDataHelper, isDataExist } from '@/helpers/ultis';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /*  isDataExist = async (field: string, data: any) => {
    const user = await this.usersRepository.findOne({
      where: { [field]: data },
    });
    if (user) return true;
    return false;
  }; */

  async handleRegister(createAuthDto: CreateAuthDto) {
    try {
      const { username, password, email } = createAuthDto;

      const isEmailExist = await isDataExist(this.usersRepository, { email });

      if (isEmailExist) {
        throw new BadRequestException(
          'Email này đã được dùng để đăng ký tài khoản khác',
        );
      }

      const isUsernameExist = await isDataExist(this.usersRepository, {
        username,
      });

      if (isUsernameExist) {
        throw new BadRequestException('Tên người dùng này đã được sử dụng');
      }

      const hashedPassword = await hashDataHelper(password);

      const newUser = this.usersRepository.create({
        username: username,
        email: email,
        password: hashedPassword,
      });
      return this.usersRepository.save(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('tạo tài khoản không thành công');
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
