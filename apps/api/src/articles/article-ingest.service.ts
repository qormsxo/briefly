import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedsService } from '../feeds/feeds.service';
import { GeminiService } from '../gemini/gemini.service';
import { ParsedFeed, RssParserService } from '../rss/rss-parser.service';
import { Article } from './article.entity';

const LOOKBACK_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ArticleIngestService {
  private readonly logger = new Logger(ArticleIngestService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
    private readonly feeds: FeedsService,
    private readonly rss: RssParserService,
    private readonly gemini: GeminiService,
  ) {}

  ingestForUser(userId: string) {
    return this.ingest(userId);
  }

  ingestAll() {
    return this.ingest();
  }

  private async ingest(userId?: string) {
    const feeds = userId
      ? await this.feeds.listByUser(userId)
      : await this.feeds.listAll();
    const since = new Date(Date.now() - LOOKBACK_MS);
    const saved: Article[] = [];

    for (const feed of feeds) {
      let parsed: ParsedFeed;
      try {
        parsed = await this.rss.parse(feed.url);
      } catch {
        this.logger.warn(`피드 수집 실패 feedId=${feed.id}`);
        continue;
      }

      for (const item of parsed.items) {
        if (!item.link) {
          continue;
        }
        const publishedAt = this.resolvePublishedAt(item);
        if (publishedAt && publishedAt < since) {
          continue;
        }

        const duplicate = await this.articles.findOneBy({
          feedId: feed.id,
          link: item.link,
        });
        if (duplicate) {
          continue;
        }

        const source =
          item.contentSnippet || item.content || item.title || '';
        let summary: string;
        try {
          summary = await this.gemini.summarize(item.title ?? '', source);
        } catch {
          this.logger.warn(`요약 실패 link=${item.link}`);
          continue;
        }

        const article = await this.articles.save(
          this.articles.create({
            feedId: feed.id,
            userId: feed.userId,
            title: item.title ?? '(제목 없음)',
            link: item.link,
            summary,
            publishedAt,
            collectedAt: new Date(),
          }),
        );
        saved.push(article);
      }
    }

    this.logger.log(
      `수집 완료 userId=${userId ?? 'all'} saved=${saved.length}`,
    );
    return saved;
  }

  private resolvePublishedAt(item: ParsedFeed['items'][number]) {
    const raw = item.isoDate ?? item.pubDate;
    if (!raw) {
      return null;
    }
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
