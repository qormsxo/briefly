import { envValidationSchema, isProduction, parseOrigins } from './env.validation';

describe('envValidationSchema', () => {
  const valid = {
    NODE_ENV: 'development',
    WEB_ORIGIN: 'http://localhost:5173',
    DATABASE_URL: 'postgresql://briefly:briefly@localhost:5432/briefly',
    DATABASE_SSL: 'false',
    KAKAO_REST_API_KEY: 'kakao-key',
    KAKAO_CLIENT_SECRET: 'kakao-secret',
    KAKAO_REDIRECT_URI: 'http://localhost:3000/api/auth/kakao/callback',
    JWT_SECRET: 'change-me-to-a-long-random-string',
    TOKEN_ENCRYPTION_KEY: '00'.repeat(32),
    GEMINI_API_KEY: 'gemini-key',
    INTERNAL_SECRET: 'change-me',
  };

  it('accepts a complete development env', () => {
    const result = envValidationSchema.validate(valid, { abortEarly: false });
    expect(result.error).toBeUndefined();
  });

  it('rejects a missing secret', () => {
    const { GEMINI_API_KEY: _omit, ...rest } = valid;
    const result = envValidationSchema.validate(rest);
    expect(result.error).toBeDefined();
  });

  it('treats only production as production', () => {
    expect(isProduction('production')).toBe(true);
    expect(isProduction('development')).toBe(false);
    expect(isProduction()).toBe(false);
  });

  it('parses origin whitelist', () => {
    expect(parseOrigins('https://app.example.com, https://docs.example.com')).toEqual([
      'https://app.example.com',
      'https://docs.example.com',
    ]);
  });
});
