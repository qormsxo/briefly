import { LogLevel } from '@nestjs/common';

const LEVELS: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];

export function nestLogLevels(level?: string): LogLevel[] {
  const current = LEVELS.includes(level as LogLevel)
    ? (level as LogLevel)
    : 'log';
  return LEVELS.slice(0, LEVELS.indexOf(current) + 1);
}
