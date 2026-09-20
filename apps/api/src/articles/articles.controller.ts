import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArticleIngestService } from './article-ingest.service';

@ApiTags('articles')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly ingest: ArticleIngestService) {}

  @Post('ingest')
  @ApiOperation({ summary: '내 피드에서 최근 24시간 글을 수집하고 요약' })
  async ingestMine(@CurrentUser() user: AuthUser) {
    const articles = await this.ingest.ingestForUser(user.id);
    return { count: articles.length };
  }
}
