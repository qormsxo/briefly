import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { AppLogger } from './app-logger';

describe('AppLogger', () => {
  it('writes application logs and skips sql queries', () => {
    const dir = mkdtempSync(join(tmpdir(), 'feed-briefly-log-'));
    const file = join(dir, 'app.log');
    const logger = new AppLogger(['error', 'warn', 'log'], file);

    logger.log('뉴스 테마 수집 theme=politics candidates=2', 'ArticleIngestService');
    logger.log('query: SELECT "Article"."id" FROM "articles"');
    logger.warn('요약 실패 link=https://example.com', 'GeminiService');

    const text = readFileSync(file, 'utf8');
    expect(text).toContain('뉴스 테마 수집 theme=politics candidates=2');
    expect(text).toContain('요약 실패 link=https://example.com');
    expect(text).not.toContain('SELECT');
  });
});
