import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { AuthService } from './auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly auth: AuthService) {
    super();
  }

  async validate(req: Request) {
    const code = req.query.code;
    if (typeof code !== 'string' || code.length === 0) {
      throw new UnauthorizedException('인가 코드가 없습니다');
    }
    return this.auth.loginWithKakaoCode(code);
  }
}
