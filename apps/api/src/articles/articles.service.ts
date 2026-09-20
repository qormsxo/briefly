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
}
