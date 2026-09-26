import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type KeywordKind = 'include' | 'exclude';

@Entity('user_keywords')
@Index(['userId', 'kind', 'word'], { unique: true })
export class UserKeyword {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 10 })
  kind: KeywordKind;

  @Column({ type: 'varchar', length: 40 })
  word: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
