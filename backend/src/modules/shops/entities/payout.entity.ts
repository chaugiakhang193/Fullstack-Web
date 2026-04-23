import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Shop } from '@/modules/shops/entities/shop.entity';

@Entity()
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shop, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  commission_fee: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  period_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  period_end: Date;

  @CreateDateColumn()
  created_at: Date;
}
