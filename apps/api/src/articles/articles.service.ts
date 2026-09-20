import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Article } from './article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articles: Repository<Article>,
  ) {}

  listCollectedSince(userId: string, since: Date, take = 5) {
    return this.articles.find({
      where: { userId, collectedAt: MoreThanOrEqual(since) },
      order: { collectedAt: 'DESC' },
      take,
    });
  }

  async paginateByUser(userId: string, page: number, limit: number) {
    const [items, total] = await this.articles.findAndCount({
      where: { userId },
      order: { collectedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  }
}
