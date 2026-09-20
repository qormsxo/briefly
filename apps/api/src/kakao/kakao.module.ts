import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { KakaoApiClient } from './kakao-api.client';
import { KakaoTalkService } from './kakao-talk.service';
import { KakaoTokenGuard } from './kakao-token.guard';
import { KakaoTokenService } from './kakao-token.service';

@Module({
  imports: [UsersModule],
  providers: [KakaoTokenService, KakaoApiClient, KakaoTalkService, KakaoTokenGuard],
  exports: [KakaoTokenService, KakaoApiClient, KakaoTalkService, KakaoTokenGuard],
})
export class KakaoModule {}
