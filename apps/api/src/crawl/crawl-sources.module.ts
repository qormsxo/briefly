import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlSource } from './crawl-source.entity';
import { HtmlCrawlerService } from './html-crawler.service';
import { UserKeyword } from './user-keyword.entity';
import { UserKeywordsController } from './user-keywords.controller';
import { UserKeywordsService } from './user-keywords.service';
import { UserTheme } from './user-theme.entity';
import { UserThemesController } from './user-themes.controller';
import { UserThemesService } from './user-themes.service';

@Module({
  imports: [TypeOrmModule.forFeature([CrawlSource, UserTheme, UserKeyword])],
  controllers: [UserThemesController, UserKeywordsController],
  providers: [UserThemesService, UserKeywordsService, HtmlCrawlerService],
  exports: [UserThemesService, UserKeywordsService, HtmlCrawlerService],
})
export class CrawlSourcesModule {}
