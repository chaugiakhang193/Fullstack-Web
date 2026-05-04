import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from '@/auth/dto/register.dto';
import { User } from '@/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  hashDataHelper,
  compareHashedDataHelper,
  isDataExist,
} from '@/helpers/ultis';

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

  async findByUsername(username: string) {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(userEmail: string) {
    return this.usersRepository.findOne({ where: { email: userEmail } });
  }

  async create(registerDto: RegisterDto) {
    const { username, password, email } = registerDto;

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
