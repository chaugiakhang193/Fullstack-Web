import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductVariant } from '@/modules/products/entities/product-variant.entity';
import { SubOrder } from '@/modules/orders/entities/sub-order.entity';
import { Product } from '@/modules/products/entities/product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @ManyToOne(() => SubOrder, (subOrder) => subOrder.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sub_order_id' })
  sub_order: SubOrder;

  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price_at_purchase: number;
}
