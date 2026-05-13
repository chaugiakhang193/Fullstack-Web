import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from '@/modules/cloudinary/cloudinary.provider';
import { CloudinaryService } from '@/modules/cloudinary/cloudinary.service';
import { MediaAsset } from '@/modules/cloudinary/entities/media-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MediaAsset])],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
