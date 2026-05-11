import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/decorator/roles.decorator';
import { UserRole } from '../enums';
import { ResponseMessage } from '@/decorator/customize';

@ApiTags('shops')
@ApiBearerAuth('access-token')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post('setup')
  @Roles(UserRole.SELLER)
  @ResponseMessage('Khởi tạo gian hàng thành công, vui lòng chờ Admin duyệt.')
  @ApiOperation({ summary: 'Seller khởi tạo thông tin gian hàng lần đầu' })
  setup(@Req() req, @Body() createShopDto: CreateShopDto) {
    const userId = req.user.id;
    return this.shopsService.setupInitialShop(userId, createShopDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả gian hàng' })
  findAll() {
    return this.shopsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một gian hàng' })
  findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin gian hàng' })
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(+id, updateShopDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa gian hàng' })
  remove(@Param('id') id: string) {
    return this.shopsService.remove(+id);
  }
}
