import { withRetry } from './retry';

describe('withRetry', () => {
  it('returns on first success', async () => {
    const fn = jest.fn(() => Promise.resolve('ok'));
    await expect(withRetry('op', fn, { delayMs: 1 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries then succeeds', async () => {
    const fn = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce(new Error('temp'))
      .mockRejectedValueOnce(new Error('temp'))
      .mockResolvedValue('ok');
    await expect(withRetry('op', fn, { delayMs: 1, retries: 3 })).resolves.toBe(
      'ok',
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws the last error after exhausting retries', async () => {
    const fn = jest.fn(() => Promise.reject(new Error('down')));
    await expect(withRetry('op', fn, { delayMs: 1, retries: 2 })).rejects.toThrow(
      'down',
    );
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
