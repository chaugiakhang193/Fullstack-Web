import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAsset } from './entities/media-asset.entity';
import { AssetType } from '@/modules/enums';

@Injectable()
export class CloudinaryService {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    ownerId?: string,
    type?: AssetType,
    shopId?: string,
  ): Promise<MediaAsset | any> {
    const result: any = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });

    if (ownerId && type) {
      const newAsset = this.mediaAssetRepository.create({
        public_id: result.public_id,
        url: result.secure_url,
        type: type,
        owner: { id: ownerId } as any,
        shop: shopId ? ({ id: shopId } as any) : null,
      });
      return await this.mediaAssetRepository.save(newAsset);
    }

    return result; // return Cloudinary result if no DB info provided
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string,
    ownerId?: string,
    type?: AssetType,
    shopId?: string,
  ): Promise<(MediaAsset | any)[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, folder, ownerId, type, shopId),
    );
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  async deleteAsset(assetId: string, ownerId: string): Promise<void> {
    const asset = await this.mediaAssetRepository.findOne({
      where: { id: assetId, owner: { id: ownerId } },
    });
    if (!asset) {
      throw new Error('Không tìm thấy hình ảnh hoặc bạn không có quyền xóa');
    }

    await this.deleteFile(asset.public_id);
    await this.mediaAssetRepository.remove(asset);
  }

  async findAssetById(assetId: string): Promise<MediaAsset | null> {
    return await this.mediaAssetRepository.findOne({
      where: { id: assetId },
      relations: ['owner', 'shop'],
    });
  }

  async findAssetByUrl(url: string): Promise<MediaAsset | null> {
    if (!url) return null;
    return await this.mediaAssetRepository.findOne({ where: { url } });
  }

  async updateAssetShopId(assetId: string, shopId: string): Promise<void> {
    // Sử dụng save với partial object để TypeORM xử lý relation chính xác hơn update()
    await this.mediaAssetRepository.save({
      id: assetId,
      shop: { id: shopId } as any,
    });
  }
}
