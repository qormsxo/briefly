import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenCryptoService } from '../common/crypto/token-crypto.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { KakaoTokenService } from './kakao-token.service';

describe('KakaoTokenService', () => {
  const crypto = {
    decrypt: jest.fn(),
    encrypt: jest.fn((value: string) => `enc:${value}`),
  };
  const users = {
    saveKakaoTokens: jest.fn(),
  };
  const config = {
    getOrThrow: jest.fn((key: string) => key),
  };

  let service: KakaoTokenService;
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
    service = new KakaoTokenService(
      config as unknown as ConfigService,
      crypto as unknown as TokenCryptoService,
      users as unknown as UsersService,
    );
  });

  it('returns decrypted access token when not expiring', async () => {
    crypto.decrypt.mockReturnValue('live-token');
    const user = {
      kakaoAccessToken: 'enc',
      kakaoTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    } as User;

    await expect(service.getValidAccessToken(user)).resolves.toBe('live-token');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refreshes when expiry is missing', async () => {
    crypto.decrypt.mockReturnValue('refresh-token');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new-access',
        expires_in: 3600,
      }),
    });
    const user = {
      id: 'u1',
      kakaoRefreshToken: 'enc-refresh',
      kakaoTokenExpiresAt: null,
    } as User;

    await expect(service.getValidAccessToken(user)).resolves.toBe('new-access');
    expect(users.saveKakaoTokens).toHaveBeenCalled();
  });

  it('throws when kakao refresh fails', async () => {
    crypto.decrypt.mockReturnValue('refresh-token');
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    const user = {
      id: 'u1',
      kakaoRefreshToken: 'enc',
      kakaoTokenExpiresAt: new Date(0),
    } as User;

    await expect(service.refresh(user)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
