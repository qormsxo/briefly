import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { FeedsService } from './feeds.service';

@ApiTags('feeds')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('feeds')
export class FeedsController {
  constructor(private readonly feeds: FeedsService) {}

  @Post()
  @ApiOperation({ summary: 'RSS 피드 등록' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateFeedDto) {
    return this.feeds.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '내 피드 목록' })
  list(@CurrentUser() user: AuthUser) {
    return this.feeds.listByUser(user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '피드 URL 수정' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeedDto,
  ) {
    return this.feeds.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '피드 삭제' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.feeds.remove(user.id, id);
    return { ok: true };
  }
}
