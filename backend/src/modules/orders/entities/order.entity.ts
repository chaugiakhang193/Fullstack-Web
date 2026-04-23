import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Coupon } from '@/modules/promotions/entities/coupon.entity';
import { SubOrder } from '@/modules/orders/entities/sub-order.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => Coupon, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'global_coupon_id' })
  global_coupon: Coupon;

  @OneToMany(() => SubOrder, (subOrder) => subOrder.order, { cascade: true })
  sub_orders: SubOrder[];

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_amount: number;

  @Column({ type: 'text', nullable: true })
  shipping_address: string;

  @CreateDateColumn()
  created_at: Date;
}
