import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InternalSecretGuard } from './internal-secret.guard';

function contextWithSecret(secret?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: secret ? { 'x-internal-secret': secret } : {},
      }),
    }),
  } as ExecutionContext;
}

describe('InternalSecretGuard', () => {
  it('allows a matching secret', () => {
    const guard = new InternalSecretGuard({
      get: () => 's3cret',
    } as unknown as ConfigService);
    expect(guard.canActivate(contextWithSecret('s3cret'))).toBe(true);
  });

  it('rejects a missing or empty env secret', () => {
    const guard = new InternalSecretGuard({
      get: () => '',
    } as unknown as ConfigService);
    expect(() => guard.canActivate(contextWithSecret('s3cret'))).toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a mismatched header', () => {
    const guard = new InternalSecretGuard({
      get: () => 's3cret',
    } as unknown as ConfigService);
    expect(() => guard.canActivate(contextWithSecret('nope'))).toThrow(
      UnauthorizedException,
    );
  });
});
