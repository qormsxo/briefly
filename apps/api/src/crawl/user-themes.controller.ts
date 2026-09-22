import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SESSION_COOKIE } from '../auth/auth.constants';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserThemesDto } from './dto/update-user-themes.dto';
import { UserThemesService } from './user-themes.service';

@ApiTags('themes')
@ApiCookieAuth(SESSION_COOKIE)
@UseGuards(JwtAuthGuard)
@Controller('themes')
export class UserThemesController {
  constructor(private readonly themes: UserThemesService) {}

  @Get()
  @ApiOperation({ summary: '뉴스 테마 목록과 내 선택' })
  list(@CurrentUser() user: AuthUser) {
    return this.themes.getForUser(user.id);
  }

  @Put()
  @ApiOperation({ summary: '관심 뉴스 테마 저장. 네이버·다음에서 글을 찾는다' })
  replace(@CurrentUser() user: AuthUser, @Body() dto: UpdateUserThemesDto) {
    return this.themes.replace(user.id, dto);
  }
}
