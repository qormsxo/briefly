import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user_themes')
@Index(['userId', 'theme'], { unique: true })
export class UserTheme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 40 })
  theme: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
