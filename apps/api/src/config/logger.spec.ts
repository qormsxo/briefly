import { describe, expect, it } from '@jest/globals';
import { nestLogLevels } from './logger';

describe('nestLogLevels', () => {
  it('includes debug in development-style levels', () => {
    expect(nestLogLevels('debug')).toEqual(['error', 'warn', 'log', 'debug']);
  });

  it('keeps production at warn and below', () => {
    expect(nestLogLevels('warn')).toEqual(['error', 'warn']);
  });
});
