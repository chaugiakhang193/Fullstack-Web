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
  SetupShopSwaggerDto,
  UpdateShopSwaggerDto,
  UploadSingleFileSwaggerDto,
  UploadMultipleFilesSwaggerDto,
} from './dto/shop-swagger.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
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
  @ApiOperation({
    summary: 'Seller khởi tạo thông tin gian hàng lần đầu',
    description:
      'Yêu cầu: \n' +
      '- Phải là tài khoản Seller chưa có gian hàng. \n' +
      '- Phải upload đủ logo (1), banner (1) và gallery (1-3 ảnh). \n' +
      '- categoryIds phải là danh mục gốc (không có danh mục cha).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: SetupShopSwaggerDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Khởi tạo thành công, đang chờ duyệt.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc thiếu file.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  @ApiUnauthorizedResponse({
    description: 'Chưa đăng nhập hoặc Token hết hạn.',
  })
  @ApiForbiddenResponse({
    description: 'Chỉ dành cho tài khoản có quyền SELLER.',
  })
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
  @ResponseMessage('Lấy chi tiết gian hàng thành công.')
  @ApiOperation({ summary: 'Seller lấy chi tiết gian hàng của mình' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Chỉ dành cho SELLER.' })
  getMyShop(@Req() req) {
    const userId = req.user.sub;
    return this.shopsService.findOneByUserId(userId);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Lấy chi tiết gian hàng thành công.')
  @ApiOperation({
    summary:
      'Lấy chi tiết một gian hàng cho người dùng guest(chưa đăng nhặp hoặc customer)',
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateShopSwaggerDto,
  })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Chỉ dành cho SELLER.' })
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
    // Update các trường thông tin gian hàng nếu có thay đổi
    // Sau đó xử lý các file media nếu có (logo, banner, gallery)
    if (updateShopDto && Object.keys(updateShopDto).length > 0) {
      await this.shopsService.updateMyShop(userId, updateShopDto);
    }

    // Upload file logo mới (optional)
    if (files?.logo?.[0]) {
      await this.shopsService.updateLogo(userId, files.logo[0]);
    }

    // Upload file banner mới (optional)
    if (files?.banner?.[0]) {
      await this.shopsService.updateBanner(userId, files.banner[0]);
    }

    // Upload thêm các file gallery mới (optional, có thể thêm tối đa 3 ảnh vào gallery)
    if (files?.gallery && files.gallery.length > 0) {
      await this.shopsService.addGalleryImages(userId, files.gallery);
    }
    // Tìm gian hàng dựa trên userId để trả về thông tin đã cập nhật mới nhất
    return await this.shopsService.findOneByUserId(userId);
  }

  @Post('my-shop/logo')
  @Roles(UserRole.SELLER)
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Cập nhật logo thành công.')
  @ApiOperation({ summary: 'Seller cập nhật logo gian hàng' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadSingleFileSwaggerDto })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Chỉ dành cho SELLER.' })
  uploadLogo(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;
    return this.shopsService.updateLogo(userId, file);
  }

  @Post('my-shop/banner')
  @Roles(UserRole.SELLER)
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Cập nhật banner thành công.')
  @ApiOperation({ summary: 'Seller cập nhật banner gian hàng' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadSingleFileSwaggerDto })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Chỉ dành cho SELLER.' })
  uploadBanner(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.sub;
    return this.shopsService.updateBanner(userId, file);
  }

  @Post('my-shop/re-apply')
  @Roles(UserRole.SELLER)
  @ResponseMessage('Đã nộp lại đơn đăng ký gian hàng thành công.')
  @ApiOperation({ summary: 'Seller nộp lại đơn đăng ký sau khi bị từ chối' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Chỉ dành cho SELLER.' })
  reApplyShop(@Req() req) {
    const userId = req.user.sub;
    return this.shopsService.reApplyShop(userId);
  }

  @Post('my-shop/gallery')
  @Roles(UserRole.SELLER)
  @UseInterceptors(FilesInterceptor('files', 3))
  @ResponseMessage('Thêm ảnh liên quan thành công.')
  @ApiOperation({ summary: 'Seller thêm tối đa 3 ảnh vào gallery' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMultipleFilesSwaggerDto })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Chỉ dành cho SELLER.' })
  addGalleryImages(@Req() req, @UploadedFiles() files: Express.Multer.File[]) {
    const userId = req.user.sub;
    return this.shopsService.addGalleryImages(userId, files);
  }

  @Delete('my-shop/gallery/:assetId')
  @Roles(UserRole.SELLER)
  @ResponseMessage('Xóa ảnh liên quan thành công.')
  @ApiOperation({ summary: 'Seller xóa 1 ảnh khỏi gallery' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Chỉ dành cho SELLER.' })
  removeGalleryImage(@Req() req, @Param('assetId') assetId: string) {
    const userId = req.user.sub;
    return this.shopsService.removeGalleryImage(userId, assetId);
  }

  // ================= ADMIN AREAS =================
  @Roles(UserRole.ADMIN)
  @Get('admin/shops-list')
  @ApiOperation({ summary: 'Lấy danh sách tất cả gian hàng' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền ADMIN.' })
  findAll() {
    return this.shopsService.findAll();
  }

  @Get('admin/pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin lấy danh sách gian hàng đang chờ duyệt' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền ADMIN.' })
  getPendingShops() {
    return this.shopsService.getPendingShops();
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Lấy chi tiết gian hàng thành công.')
  @ApiOperation({ summary: 'Admin xem chi tiết một gian hàng' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền ADMIN.' })
  findOneAdmin(@Param('id') id: string) {
    return this.shopsService.findOneByShopId(id);
  }

  @Patch('admin/:id/approve')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Đã duyệt gian hàng thành công.')
  @ApiOperation({ summary: 'Admin duyệt gian hàng' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền ADMIN.' })
  approveShop(@Param('id') id: string) {
    return this.shopsService.approveShop(id);
  }

  @Patch('admin/:id/reject')
  @Roles(UserRole.ADMIN)
  @ResponseMessage('Đã từ chối gian hàng.')
  @ApiOperation({ summary: 'Admin từ chối gian hàng' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập.' })
  @ApiForbiddenResponse({ description: 'Yêu cầu quyền ADMIN.' })
  rejectShop(@Param('id') id: string, @Body('reason') reason: string) {
    return this.shopsService.rejectShop(id, reason);
  }
}
