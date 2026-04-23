import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Shop } from '@/modules/shops/entities/shop.entity';
import { Category } from '@/modules/products/entities/category.entity';
import { ProductVariant } from '@/modules/products/entities/product-variant.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  price: number;

  @Column({ nullable: true })
  image_url: string;

  @Column({ type: 'int', default: 0 })
  stock_quantity: number;

  @Column({ default: false })
  is_hidden: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
