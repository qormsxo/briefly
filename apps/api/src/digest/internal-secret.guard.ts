import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const secret = request.headers['x-internal-secret'];
    const expected = this.config.get<string>('INTERNAL_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
