import 'multer';
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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import {
  FileInterceptor,
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ShopsService } from '@/modules/shops/shops.service';
import { CreateShopDto } from '@/modules/shops/dto/create-shop.dto';
import { UpdateShopDto } from '@/modules/shops/dto/update-shop.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/decorator/roles.decorator';
import { UserRole } from '../enums';
import { ResponseMessage, Public } from '@/decorator/customize';

@ApiTags('shop')
@ApiBearerAuth('access-token')
@Controller('shop')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post('setup')
  @Roles(UserRole.SELLER)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'gallery', maxCount: 3 },
    ]),
  )
  @ResponseMessage('Khởi tạo gian hàng thành công, vui lòng chờ Admin duyệt.')
  @ApiOperation({ summary: 'Seller khởi tạo thông tin gian hàng lần đầu' })
  setup(
    @Req() req,
    @Body() createShopDto: CreateShopDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;
    return this.shopsService.setupInitialShop(userId, createShopDto, files);
  }
  @Get('my-shop')
  @Roles(UserRole.SELLER)
  @ApiOperation({ summary: 'Lấy chi tiết gian hàng của mình' })
  getMyShop(@Req() req) {
    const userId = req.user.sub;
    return this.shopsService.findOneByUserId(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary:
      'Lấy chi tiết một gian hàng cho người dùng guest(chưa đăng nhặp hoặc customer',
  })
  findOne(@Param('id') id: string) {
    return this.shopsService.findOneByShopId(id, true);
  }

  @Patch('my-shop')
  @Roles(UserRole.SELLER)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'gallery', maxCount: 3 },
    ]),
  )
  @ResponseMessage('Cập nhật thông tin gian hàng thành công.')
  @ApiOperation({ summary: 'Seller cập nhật thông tin gian hàng của mình' })
  async updateMyShop(
    @Req() req,
    @Body() updateShopDto: UpdateShopDto,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    const userId = req.user.sub;
    // Update non‑file fields if any are provided
    if (updateShopDto && Object.keys(updateShopDto).length > 0) {
      await this.shopsService.updateMyShop(userId, updateShopDto);
    }

    // Handle optional logo upload
    if (files?.logo?.[0]) {
      await this.shopsService.updateLogo(userId, files.logo[0]);
    }

    // Handle optional banner upload
    if (files?.banner?.[0]) {
      await this.shopsService.updateBanner(userId, files.banner[0]);
    }

    // Handle optional gallery uploads (add new images)
    if (files?.gallery && files.gallery.length > 0) {
      await this.shopsService.addGalleryImages(userId, files.gallery);
    }

    // Return the latest shop data after possible media updates
    return await this.shopsService.findOneByUserId(userId);
  }

  @Post('my-shop/logo')
  @Roles(UserRole.SELLER)
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Cập nhật logo thành công.')
  @ApiOperation({ summary: 'Seller cập nhật logo gian hàng' })
  uploadLogo(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;
    return this.shopsService.updateLogo(userId, file);
  }

  @Post('my-shop/banner')
  @Roles(UserRole.SELLER)
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Cập nhật banner thành công.')
  @ApiOperation({ summary: 'Seller cập nhật banner gian hàng' })
  uploadBanner(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;
    return this.shopsService.updateBanner(userId, file);
  }

  @Post('my-shop/re-apply')
  @Roles(UserRole.SELLER)
  @ResponseMessage('Đã nộp lại đơn đăng ký gian hàng thành công.')
  @ApiOperation({ summary: 'Seller nộp lại đơn đăng ký sau khi bị từ chối' })
  reApplyShop(@Req() req) {
    const userId = req.user.sub;
    return this.shopsService.reApplyShop(userId);
  }

  @Post('my-shop/gallery')
  @Roles(UserRole.SELLER)
  @UseInterceptors(FilesInterceptor('files', 3))
  @ResponseMessage('Thêm ảnh liên quan thành công.')
  @ApiOperation({ summary: 'Seller thêm tối đa 3 ảnh vào gallery' })
  addGalleryImages(@Req() req, @UploadedFiles() files: Express.Multer.File[]) {
    const userId = req.user.sub;
    return this.shopsService.addGalleryImages(userId, files);
  }

  @Delete('my-shop/gallery/:assetId')
  @Roles(UserRole.SELLER)
  @ResponseMessage('Xóa ảnh liên quan thành công.')
  @ApiOperation({ summary: 'Seller xóa 1 ảnh khỏi gallery' })
  removeGalleryImage(@Req() req, @Param('assetId') assetId: string) {
    const userId = req.user.sub;
    return this.shopsService.removeGalleryImage(userId, assetId);
  }

  // ================= ADMIN AREAS =================
  @Roles(UserRole.ADMIN)
  @Get('admin/shops-list')
  @ApiOperation({ summary: 'Lấy danh sách tất cả gian hàng' })
  findAll() {
    return this.shopsService.findAll();
  }

  @Get('admin/pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin lấy danh sách gian hàng đang chờ duyệt' })
  getPendingShops() {
    return this.shopsService.getPendingShops();
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Lấy chi tiết gian hàng thành công.')
  @ApiOperation({ summary: 'Admin xem chi tiết một gian hàng' })
  findOneAdmin(@Param('id') id: string) {
    return this.shopsService.findOneByShopId(id);
  }

  @Patch('admin/:id/approve')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Đã duyệt gian hàng thành công.')
  @ApiOperation({ summary: 'Admin duyệt gian hàng' })
  approveShop(@Param('id') id: string) {
    return this.shopsService.approveShop(id);
  }

  @Patch('admin/:id/reject')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Đã từ chối gian hàng.')
  @ApiOperation({ summary: 'Admin từ chối gian hàng' })
  rejectShop(@Param('id') id: string, @Body('reason') reason: string) {
    return this.shopsService.rejectShop(id, reason);
  }
}
