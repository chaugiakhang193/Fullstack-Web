import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Shop } from '@/modules/shops/entities/shop.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null; //null là trường hợp nó là danh mục gốc (không có cha)

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[]; // danh mục con

  @Column({ type: 'int', nullable: true })
  display_order: number; //thứ tự hiển thị

  @ManyToMany(() => Shop, (shop) => shop.categories)
  shops: Shop[]; // gian hàng kinh doanh danh mục này

  @CreateDateColumn()
  created_at: Date;
}
