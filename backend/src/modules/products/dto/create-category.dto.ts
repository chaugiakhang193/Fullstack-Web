import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  ValidateIf,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Thời trang nam', description: 'Tên danh mục' })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
  name: string;

  @ApiProperty({
    example: 'uuid-danh-muc-cha',
    description: 'ID danh mục cha (nếu có)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((object, value) => value !== null)
  @IsUUID('all', { message: 'ID danh mục cha không đúng định dạng' })
  parentId?: string | null;

  @ApiProperty({
    example: 1,
    description: 'Thứ tự hiển thị',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Thứ tự hiển thị phải là số' })
  display_order?: number;
}
