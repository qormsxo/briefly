import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RssModule } from '../rss/rss.module';
import { Feed } from './feed.entity';
import { FeedsService } from './feeds.service';

// RSS 등록 API는 잠시 사용하지 않는다.
// 다시 켤 때는 FeedsController를 import해서 controllers에 넣는다.
// import { FeedsController } from './feeds.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Feed]), RssModule],
  controllers: [],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}
