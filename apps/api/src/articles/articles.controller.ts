import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArticleIngestService } from './article-ingest.service';
import { ArticlesService } from './articles.service';
import { ListArticlesQuery } from './dto/list-articles.query';

@ApiTags('articles')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly ingest: ArticleIngestService,
    private readonly articles: ArticlesService,
  ) {}

  @Get()
  @ApiOperation({ summary: '내 요약 히스토리' })
  list(@CurrentUser() user: AuthUser, @Query() query: ListArticlesQuery) {
    return this.articles.paginateByUser(user.id, query.page, query.limit);
  }

  @Post('ingest')
  @ApiOperation({ summary: '내 피드에서 최근 24시간 글을 수집하고 요약' })
  async ingestMine(@CurrentUser() user: AuthUser) {
    const articles = await this.ingest.ingestForUser(user.id);
    return { count: articles.length };
  }
}
