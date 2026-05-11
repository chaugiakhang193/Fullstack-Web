import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { Shop } from './entities/shop.entity';
import { Category } from '@/modules/products/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, Category])],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
