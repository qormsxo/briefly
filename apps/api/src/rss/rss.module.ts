import { Module } from '@nestjs/common';
import { RssParserService } from './rss-parser.service';

@Module({
  providers: [RssParserService],
  exports: [RssParserService],
})
export class RssModule {}
