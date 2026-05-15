import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { ShopsService } from '@/modules/shops/shops.service';
import { UsersService } from '@/modules/users/users.service';

// Controllers
import { ShopsController } from '@/modules/shops/shops.controller';
import { SellerShopsController } from '@/modules/shops/seller-shops.controller';
import { AdminShopsController } from '@/modules/shops/admin-shops.controller';

// Entities
import { Shop } from '@/modules/shops/entities/shop.entity';
import { Category } from '@/modules/products/entities/category.entity';
import { User } from '@/modules/users/entities/user.entity';

// Modules
import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, Category, User]), CloudinaryModule],
  controllers: [ShopsController, SellerShopsController, AdminShopsController],
  providers: [ShopsService, UsersService],
  exports: [ShopsService],
})
export class ShopsModule {}
