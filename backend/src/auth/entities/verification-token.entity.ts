import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

@Entity()
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;
}
