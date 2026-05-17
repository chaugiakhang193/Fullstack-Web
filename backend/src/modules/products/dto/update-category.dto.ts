import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from '@/modules/products/dto/create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
