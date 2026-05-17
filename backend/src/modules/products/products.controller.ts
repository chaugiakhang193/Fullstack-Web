import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';

// Services
import { ProductsService } from '@/modules/products/products.service';

// DTOs
import { CreateProductDto } from '@/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '@/modules/products/dto/update-product.dto';

// Guards & Decorators
import { Roles } from '@/decorator/roles.decorator';
import { User } from '@/decorator/user.decorator';
import { Public } from '@/decorator/customize';

// Enums & Interfaces
import { UserRole } from '@/modules/enums';
import type { IUser } from '@/interface/user.interface';

@ApiTags('products')
@ApiBearerAuth('access-token')
@Roles(UserRole.SELLER)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'general_gallery', maxCount: 5 },
      { name: 'variant_images', maxCount: 30 },
    ]),
  )
  @ApiOperation({ summary: 'Seller tạo sản phẩm mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        sku: { type: 'string' },
        weight: { type: 'number', description: 'Trọng lượng (gram)' },
        length: { type: 'number', description: 'Chiều dài (cm)' },
        width: { type: 'number', description: 'Chiều rộng (cm)' },
        height: { type: 'number', description: 'Chiều cao (cm)' },
        category_id: { type: 'string' },
        has_variants: { type: 'boolean' },
        stock_quantity: { type: 'number' },
        variants: {
          type: 'string',
          description: 'JSON string of variants array',
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
        general_gallery: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        variant_images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      general_gallery?: Express.Multer.File[];
      variant_images?: Express.Multer.File[];
    },
    @User() user: IUser,
  ) {
    return this.productsService.create(createProductDto, files, user);
  }

  @Get('my-shop')
  @ApiOperation({ summary: 'Seller lấy danh sách sản phẩm của chính mình' })
  findAllByShop(@User() user: IUser) {
    // TODO: Implement pagination
    return this.productsService.findAllByShop(user.sub);
  }

  @Get()
  @Public()
  findAll() {
    // TODO: Implement pagination
    return this.productsService.findAll();
  }

  @Get(':id')
  @Public()
  async findOne(
    @Param('id') idWithSlug: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const product = await this.productsService.findOne(idWithSlug, true);

    // Logic SEO Redirect 301
    // Nếu URL không chứa '-i.' hoặc slug không khớp với slug hiện tại trong DB
    const canonicalPart = `${product.slug}-i.${product.id}`;

    if (idWithSlug !== canonicalPart) {
      return res.redirect(301, `/api/v1/products/${canonicalPart}`);
    }

    return product;
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'general_gallery', maxCount: 5 },
      { name: 'variant_images', maxCount: 30 },
    ]),
  )
  @ApiOperation({ summary: 'Seller cập nhật sản phẩm' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        sku: { type: 'string' },
        weight: { type: 'number' },
        length: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        category_id: { type: 'string' },
        has_variants: { type: 'boolean' },
        stock_quantity: { type: 'number' },
        status: {
          type: 'string',
          enum: ['active', 'deleted'],
          description: 'Trạng thái hoạt động của sản phẩm',
        },
        is_hidden: {
          type: 'boolean',
          description: 'Ẩn/hiện sản phẩm với khách hàng',
        },
        variants: {
          type: 'string',
          description: 'JSON string of variants array',
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
        general_gallery: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        variant_images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      general_gallery?: Express.Multer.File[];
      variant_images?: Express.Multer.File[];
    },
    @User() user: IUser,
  ) {
    return this.productsService.update(id, updateProductDto, files, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Seller xóa sản phẩm (Soft delete)' })
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.productsService.remove(id, user);
  }
}
