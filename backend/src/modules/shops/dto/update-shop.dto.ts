import { PartialType } from '@nestjs/swagger';
import { CreateShopDto } from '@/modules/shops/dto/create-shop.dto';

export class UpdateShopDto extends PartialType(CreateShopDto) {}
