import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/decorator/roles.decorator';
import { UserRole } from '../enums';
import { ResponseMessage } from '@/decorator/customize';
import { Public } from '@/decorator/customize';
import { ApiGenericResponse } from '@/decorator/api-response.decorator';
import { Category } from './entities/category.entity';
import { ApiResponse } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Tạo danh mục thành công')
  @ApiOperation({ summary: 'Admin tạo danh mục mới' })
  @ApiGenericResponse(Category, 'Tạo danh mục thành công', { status: 201 })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền Admin' })
  @ApiResponse({ status: 409, description: 'Danh mục hoặc Slug đã tồn tại' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Public()
  @ResponseMessage('Lấy danh mục thành công')
  @ApiOperation({ summary: 'Lấy danh sách tất cả danh mục (Public)' })
  @ApiGenericResponse(Category, 'Lấy danh sách danh mục thành công', {
    isArray: true,
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Lấy chi tiết danh mục thành công')
  @ApiOperation({ summary: 'Lấy chi tiết một danh mục' })
  @ApiGenericResponse(Category, 'Lấy chi tiết danh mục thành công')
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOneById(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Cập nhật danh mục thành công')
  @ApiOperation({ summary: 'Admin cập nhật danh mục' })
  @ApiGenericResponse(Category, 'Cập nhật danh mục thành công')
  @ApiResponse({ status: 400, description: 'Dữ liệu cập nhật không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền Admin' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy danh mục để cập nhật',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateById(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Xóa danh mục thành công')
  @ApiOperation({ summary: 'Admin xóa danh mục' })
  @ApiGenericResponse('Xóa danh mục thành công')
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập' })
  @ApiResponse({ status: 403, description: 'Không có quyền Admin' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy danh mục để xóa' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.removeById(id);
  }
}
