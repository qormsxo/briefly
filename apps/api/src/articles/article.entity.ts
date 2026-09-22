import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CrawlSource } from '../crawl/crawl-source.entity';
import { Feed } from '../feeds/feed.entity';

@Entity('articles')
@Index(['feedId', 'link'], { unique: true })
@Index(['crawlSourceId', 'link'], { unique: true })
@Index(['userId', 'collectedAt'])
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Feed, { onDelete: 'CASCADE', nullable: true })
  feed: Feed | null;

  @Column({ type: 'uuid', nullable: true })
  feedId: string | null;

  @ManyToOne(() => CrawlSource, { onDelete: 'CASCADE', nullable: true })
  crawlSource: CrawlSource | null;

  @Column({ type: 'uuid', nullable: true })
  crawlSourceId: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  theme: string | null;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column()
  link: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'smallint', default: 5 })
  interest: number;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'timestamptz' })
  collectedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  kakaoSentAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
