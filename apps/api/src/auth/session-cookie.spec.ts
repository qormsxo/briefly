import { sessionCookieOptions } from './session-cookie';

describe('sessionCookieOptions', () => {
  it('keeps local cookies lax and not secure', () => {
    expect(
      sessionCookieOptions({
        nodeEnv: 'development',
        webOrigin: 'http://localhost:5173',
        redirectUri: 'http://localhost:3000/api/auth/kakao/callback',
      }),
    ).toMatchObject({ httpOnly: true, secure: false, sameSite: 'lax' });
  });

  it('uses SameSite=None when frontend and API hosts differ', () => {
    expect(
      sessionCookieOptions({
        nodeEnv: 'production',
        webOrigin: 'https://briefly.vercel.app',
        redirectUri: 'https://briefly-api.fly.dev/api/auth/kakao/callback',
      }),
    ).toMatchObject({ httpOnly: true, secure: true, sameSite: 'none' });
  });

  it('uses SameSite=Lax when frontend and API share a host', () => {
    expect(
      sessionCookieOptions({
        nodeEnv: 'production',
        webOrigin: 'https://briefly.example.com',
        redirectUri: 'https://briefly.example.com/api/auth/kakao/callback',
      }),
    ).toMatchObject({ httpOnly: true, secure: true, sameSite: 'lax' });
  });
});
