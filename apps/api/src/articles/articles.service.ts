import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { Article } from './article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
  ) {}

  listUnsentSince(userId: string, since: Date, take = 20) {
    return this.articles.find({
      where: {
        userId,
        collectedAt: MoreThanOrEqual(since),
        kakaoSentAt: IsNull(),
      },
      order: { collectedAt: 'DESC' },
      take,
    });
  }

  markKakaoSent(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve();
    }
    return this.articles.update({ id: In(ids) }, { kakaoSentAt: new Date() });
  }

  async paginateByUser(userId: string, page: number, limit: number) {
    const [rows, total] = await this.articles.findAndCount({
      where: { userId },
      relations: { feed: true },
      order: { collectedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        link: row.link,
        summary: row.summary,
        publishedAt: row.publishedAt,
        collectedAt: row.collectedAt,
        feedTitle: row.feed?.title ?? null,
        feedUrl: row.feed?.url ?? null,
      })),
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  }
}
