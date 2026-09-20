import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feed } from '../feeds/feed.entity';

@Entity('articles')
@Index(['feedId', 'link'], { unique: true })
@Index(['userId', 'collectedAt'])
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Feed, { onDelete: 'CASCADE' })
  feed: Feed;

  @Column()
  feedId: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column()
  link: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'timestamptz' })
  collectedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
