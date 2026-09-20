import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { KakaoApiClient } from './kakao-api.client';
import { KakaoTokenGuard } from './kakao-token.guard';
import { KakaoTokenService } from './kakao-token.service';

@Module({
  imports: [UsersModule],
  providers: [KakaoTokenService, KakaoApiClient, KakaoTokenGuard],
  exports: [KakaoTokenService, KakaoApiClient, KakaoTokenGuard],
})
export class KakaoModule {}
