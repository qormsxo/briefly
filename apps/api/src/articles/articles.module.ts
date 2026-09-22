import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlSourcesModule } from '../crawl/crawl-sources.module';
import { DigestModule } from '../digest/digest.module';
import { FeedsModule } from '../feeds/feeds.module';
import { GeminiModule } from '../gemini/gemini.module';
import { RssModule } from '../rss/rss.module';
import { Article } from './article.entity';
import { ArticleIngestService } from './article-ingest.service';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    FeedsModule,
    CrawlSourcesModule,
    RssModule,
    GeminiModule,
    forwardRef(() => DigestModule),
  ],
  controllers: [ArticlesController],
  providers: [ArticleIngestService, ArticlesService],
  exports: [ArticleIngestService, ArticlesService],
})
export class ArticlesModule {}
