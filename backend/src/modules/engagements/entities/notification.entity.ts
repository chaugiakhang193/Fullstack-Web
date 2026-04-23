import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
