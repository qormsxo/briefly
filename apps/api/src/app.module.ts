import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { CrawlSourcesModule } from './crawl/crawl-sources.module';
import { CommonModule } from './common/common.module';
import { envValidationSchema } from './config/env.validation';
import { typeormNestOptions } from './config/typeorm.config';
import { DigestModule } from './digest/digest.module';
import { FeedsModule } from './feeds/feeds.module';
import { HealthModule } from './health/health.module';
import { KakaoModule } from './kakao/kakao.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        typeormNestOptions({
          NODE_ENV: config.get('NODE_ENV'),
          DATABASE_URL: config.getOrThrow<string>('DATABASE_URL'),
          DATABASE_SSL: config.get('DATABASE_SSL'),
        }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    CommonModule,
    UsersModule,
    AuthModule,
    KakaoModule,
    FeedsModule,
    CrawlSourcesModule,
    ArticlesModule,
    DigestModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
