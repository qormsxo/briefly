import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KAKAO_TOKEN_URL } from '../auth/auth.constants';
import { KakaoTokenResponse } from '../auth/kakao.types';
import { TokenCryptoService } from '../common/crypto/token-crypto.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

const EXPIRY_SKEW_MS = 2 * 60 * 1000;

@Injectable()
export class KakaoTokenService {
  private readonly logger = new Logger(KakaoTokenService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly crypto: TokenCryptoService,
    private readonly users: UsersService,
  ) {}

  async getValidAccessToken(user: User): Promise<string> {
    if (!this.isExpiringSoon(user.kakaoTokenExpiresAt)) {
      return this.crypto.decrypt(user.kakaoAccessToken);
    }
    return this.refresh(user);
  }

  async refresh(user: User): Promise<string> {
    const refreshToken = this.crypto.decrypt(user.kakaoRefreshToken);
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.getOrThrow('KAKAO_REST_API_KEY'),
      client_secret: this.config.getOrThrow('KAKAO_CLIENT_SECRET'),
      refresh_token: refreshToken,
    });

    const response = await fetch(KAKAO_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      this.logger.warn(
        `카카오 토큰 갱신 실패 userId=${user.id} status=${response.status}`,
      );
      throw new UnauthorizedException('카카오 토큰 갱신에 실패했습니다');
    }

    const tokens = (await response.json()) as KakaoTokenResponse;
    const nextRefresh = tokens.refresh_token
      ? this.crypto.encrypt(tokens.refresh_token)
      : user.kakaoRefreshToken;

    await this.users.saveKakaoTokens(user, {
      kakaoAccessToken: this.crypto.encrypt(tokens.access_token),
      kakaoRefreshToken: nextRefresh,
      kakaoTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    });

    return tokens.access_token;
  }

  private isExpiringSoon(expiresAt: Date | null) {
    if (!expiresAt) {
      return true;
    }
    return expiresAt.getTime() - Date.now() < EXPIRY_SKEW_MS;
  }
}
