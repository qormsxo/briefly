import { Logger } from '@nestjs/common';

export type RetryOptions = {
  retries?: number;
  delayMs?: number;
  logger?: Logger;
};

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
      options.logger?.warn(
        `${operation} 실패 attempt=${attempt}/${retries} reason=${reason}`,
      );
      if (attempt < retries) {
        await sleep(delayMs * attempt);
      }
    }
  }

  throw lastError;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
