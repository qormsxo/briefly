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
      const result = await this.sendUnsentForUser(user.id, since);
      results.push({
        userId: user.id,
        status: result.error ? 'failure' : 'success',
        articleCount: result.sent,
      });
    }

    return { ingested: ingested.length, results };
  }

  async sendUnsentForUser(userId: string, since: Date) {
    const user = await this.users.findById(userId);
    if (!user) {
      return { sent: 0, error: '사용자를 찾을 수 없습니다' };
    }

    const unsent = await this.articles.listUnsentSince(userId, since);
    if (unsent.length === 0) {
      return { sent: 0 };
    }

    try {
      await this.talk.sendMemoToMe(user, this.buildFeed(unsent));
      await this.articles.markKakaoSent(unsent.map((article) => article.id));
      await this.logs.save(
        this.logs.create({
          userId,
          status: 'success',
          articleCount: unsent.length,
          errorMessage: null,
        }),
      );
      return { sent: unsent.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.warn(`브리핑 발송 실패 userId=${userId} reason=${message}`);
      await this.logs.save(
        this.logs.create({
          userId,
          status: 'failure',
          articleCount: unsent.length,
          errorMessage: message,
        }),
      );
      return { sent: 0, error: message };
    }
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
