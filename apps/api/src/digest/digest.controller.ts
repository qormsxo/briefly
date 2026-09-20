import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { DigestService } from './digest.service';
import { InternalSecretGuard } from './internal-secret.guard';

@ApiTags('internal')
@ApiSecurity('internal-secret')
@SkipThrottle()
@Controller('internal')
export class DigestController {
  constructor(private readonly digest: DigestService) {}

  // GitHub Actions 크론이 매일 아침 이 엔드포인트를 호출한다.
  @Post('run-digest')
  @UseGuards(InternalSecretGuard)
  @ApiHeader({ name: 'x-internal-secret', required: true })
  @ApiOperation({ summary: '수집/요약 후 카카오톡 브리핑 발송 (크론 전용)' })
  runDigest() {
    return this.digest.runDailyDigest();
  }
}
