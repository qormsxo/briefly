import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesModule } from '../articles/articles.module';
import { KakaoModule } from '../kakao/kakao.module';
import { UsersModule } from '../users/users.module';
import { DigestLog } from './digest-log.entity';
import { DigestController } from './digest.controller';
import { DigestService } from './digest.service';
import { InternalSecretGuard } from './internal-secret.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([DigestLog]),
    forwardRef(() => ArticlesModule),
    UsersModule,
    KakaoModule,
  ],
  controllers: [DigestController],
  providers: [DigestService, InternalSecretGuard],
  exports: [DigestService],
})
export class DigestModule {}
