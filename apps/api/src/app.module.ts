import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
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
    CommonModule,
    UsersModule,
    AuthModule,
    KakaoModule,
    FeedsModule,
    ArticlesModule,
    DigestModule,
    HealthModule,
  ],
})
export class AppModule {}
