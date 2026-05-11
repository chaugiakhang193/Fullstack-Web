import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { In, Repository } from 'typeorm';
import { Category } from '../products/entities/category.entity';
import { AccountStatus } from '../enums';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async setupInitialShop(userId: string, createShopDto: CreateShopDto) {
    const { categoryIds, ...shopInfo } = createShopDto;

    // Kiểm tra xem seller này đã có Shop chưa
    const existingShop = await this.shopsRepository.findOne({
      where: { seller: { id: userId } },
    });

    if (existingShop) {
      throw new BadRequestException('Bạn đã có gian hàng trên hệ thống rồi');
    }

    // Kiểm tra danh mục có tồn tại không
    const categories = await this.categoriesRepository.find({
      where: { id: In(categoryIds) },
    });

    if (categories.length === 0) {
      throw new BadRequestException('Danh mục không hợp lệ');
    }

    // Tạo mới Shop
    const newShop = this.shopsRepository.create({
      ...shopInfo,
      seller: { id: userId } as any,
      categories: categories,
    });

    return await this.shopsRepository.save(newShop);
  }

  findAll() {
    return this.shopsRepository.find({ relations: ['seller', 'categories'] });
  }

  async findOne(id: string) {
    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: ['seller', 'categories'],
    });
    if (!shop) throw new NotFoundException('Không tìm thấy gian hàng');
    return shop;
  }

  update(id: number, updateShopDto: UpdateShopDto) {
    return `This action updates a #${id} shop`;
  }

  remove(id: number) {
    return `This action removes a #${id} shop`;
  }
}
