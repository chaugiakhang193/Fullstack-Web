import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssetType } from '@/modules/enums';
import { User } from '@/modules/users/entities/user.entity';
import { Shop } from '@/modules/shops/entities/shop.entity';

@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  public_id: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: AssetType,
  })
  type: AssetType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'shop_id', nullable: true })
  shopId: string;

  @ManyToOne(() => Shop, (shop) => shop.gallery, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ nullable: true })
  product_id: string;

  @CreateDateColumn()
  created_at: Date;
}
