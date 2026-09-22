import { Logger } from '@nestjs/common';

export type RetryOptions = {
  retries?: number;
  delayMs?: number;
  logger?: Logger;
  retryOn?: (error: unknown) => boolean;
};

export function isDailyQuotaError(error: unknown): boolean {
  if (statusOf(error) === 429) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('[429') || message.includes('Quota exceeded');
}

export async function withRetry<T>(
  operation: string,
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const retries = options.retries ?? 3;
  const delayMs = options.delayMs ?? 400;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const reason = error instanceof Error ? error.message : String(error);
      const retry =
        attempt < retries && (options.retryOn?.(error) ?? true);
      options.logger?.warn(
        `${operation} 실패 attempt=${attempt}/${retries} reason=${reason}`,
      );
      if (!retry) {
        break;
      }
      await sleep(delayMs * attempt);
    }
  }

  throw lastError;
}

function statusOf(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
