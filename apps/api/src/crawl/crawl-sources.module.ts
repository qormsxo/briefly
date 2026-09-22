import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlSource } from './crawl-source.entity';
import { HtmlCrawlerService } from './html-crawler.service';
import { UserTheme } from './user-theme.entity';
import { UserThemesController } from './user-themes.controller';
import { UserThemesService } from './user-themes.service';

@Module({
  imports: [TypeOrmModule.forFeature([CrawlSource, UserTheme])],
  controllers: [UserThemesController],
  providers: [UserThemesService, HtmlCrawlerService],
  exports: [UserThemesService, HtmlCrawlerService],
})
export class CrawlSourcesModule {}
