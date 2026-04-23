import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ type: 'int', nullable: true })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;
}
