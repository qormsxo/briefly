import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SESSION_COOKIE } from './auth/auth.constants';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('briefly API')
    .setDescription(
      [
        '개인용 RSS 요약 브리핑 API.',
        '',
        '로그인: 브라우저에서 `/api/auth/kakao`로 카카오 로그인한 뒤,',
        '같은 브라우저에서 이 문서를 열면 `briefly_session` 쿠키가 붙는다.',
        '크론 발송은 Authorize에 `x-internal-secret`을 넣는다.',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .addCookieAuth(SESSION_COOKIE, {
      type: 'apiKey',
      in: 'cookie',
      name: SESSION_COOKIE,
    })
    .addApiKey(
      { type: 'apiKey', in: 'header', name: 'x-internal-secret' },
      'internal-secret',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerUi = {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
  };
  SwaggerModule.setup('docs', app, document, swaggerUi);
  SwaggerModule.setup('docs', app, document, {
    ...swaggerUi,
    useGlobalPrefix: true,
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
