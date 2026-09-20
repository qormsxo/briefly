import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedsService } from '../feeds/feeds.service';
import { GeminiService } from '../gemini/gemini.service';
import { ParsedFeed, RssParserService } from '../rss/rss-parser.service';
import { Article } from './article.entity';

const LOOKBACK_MS = 24 * 60 * 60 * 1000;
const MAX_ITEMS_PER_FEED = 5;
const FALLBACK_ITEMS_PER_FEED = 3;

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

      const candidates = this.pickCandidates(parsed.items, since);
      this.logger.log(
        `피드 수집 url=${feed.url} candidates=${candidates.length}`,
      );

      for (const item of candidates) {
        const duplicate = await this.articles.findOneBy({
          feedId: feed.id,
          link: item.link,
        });
        if (duplicate) {
          continue;
        }

        const source =
          item.contentSnippet || item.content || item.title || '';
        let brief;
        try {
          brief = await this.gemini.summarize(item.title ?? '', source);
        } catch {
          this.logger.warn(`요약 실패 link=${item.link}`);
          continue;
        }

        const article = await this.articles.save(
          this.articles.create({
            feedId: feed.id,
            userId: feed.userId,
            title: brief.title,
            link: item.link,
            summary: brief.summary,
            interest: brief.interest,
            publishedAt: this.resolvePublishedAt(item),
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

  private pickCandidates(
    items: ParsedFeed['items'],
    since: Date,
  ): ParsedFeed['items'] {
    const withLink = items.filter((item) => Boolean(item.link));
    const recent = withLink.filter((item) => {
      const publishedAt = this.resolvePublishedAt(item);
      return !publishedAt || publishedAt >= since;
    });
    if (recent.length > 0) {
      return recent.slice(0, MAX_ITEMS_PER_FEED);
    }
    return withLink.slice(0, FALLBACK_ITEMS_PER_FEED);
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
