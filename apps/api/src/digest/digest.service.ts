import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleIngestService } from '../articles/article-ingest.service';
import { ArticlesService } from '../articles/articles.service';
import { KakaoFeedTemplate, KakaoTalkService } from '../kakao/kakao-talk.service';
import { UsersService } from '../users/users.service';
import { DigestLog } from './digest-log.entity';

const LOOKBACK_MS = 24 * 60 * 60 * 1000;
const DEFAULT_IMAGE =
  'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png';

@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  constructor(
    @InjectRepository(DigestLog)
    private readonly logs: Repository<DigestLog>,
    private readonly ingest: ArticleIngestService,
    private readonly articles: ArticlesService,
    private readonly users: UsersService,
    private readonly talk: KakaoTalkService,
    private readonly config: ConfigService,
  ) {}

  async runDailyDigest() {
    const ingested = await this.ingest.ingestAll();
    const since = new Date(Date.now() - LOOKBACK_MS);
    const users = await this.users.findAll();
    const results: Array<{ userId: string; status: string; articleCount: number }> =
      [];

    for (const user of users) {
      const recent = await this.articles.listCollectedSince(user.id, since);
      try {
        if (recent.length > 0) {
          await this.talk.sendMemoToMe(user, this.buildFeed(recent));
        }
        await this.logs.save(
          this.logs.create({
            userId: user.id,
            status: 'success',
            articleCount: recent.length,
            errorMessage: null,
          }),
        );
        results.push({
          userId: user.id,
          status: 'success',
          articleCount: recent.length,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown';
        this.logger.warn(`브리핑 발송 실패 userId=${user.id} reason=${message}`);
        await this.logs.save(
          this.logs.create({
            userId: user.id,
            status: 'failure',
            articleCount: recent.length,
            errorMessage: message,
          }),
        );
        results.push({
          userId: user.id,
          status: 'failure',
          articleCount: recent.length,
        });
      }
    }

    return { ingested: ingested.length, results };
  }

  private buildFeed(
    articles: Array<{ title: string; summary: string; link: string }>,
  ): KakaoFeedTemplate {
    const webOrigin = this.config.get('WEB_ORIGIN') ?? 'http://localhost:5173';
    const historyUrl = `${webOrigin}/history`;
    const imageUrl = this.config.get('KAKAO_FEED_IMAGE_URL') ?? DEFAULT_IMAGE;
    const description = articles
      .map((article) => article.title)
      .join(' / ')
      .slice(0, 100);

    return {
      object_type: 'feed',
      content: {
        title: `briefly 브리핑 · ${articles.length}건`,
        description,
        image_url: imageUrl,
        link: { web_url: historyUrl, mobile_web_url: historyUrl },
      },
      buttons: [
        {
          title: '전체 요약 보기',
          link: { web_url: historyUrl, mobile_web_url: historyUrl },
        },
      ],
    };
  }
}
