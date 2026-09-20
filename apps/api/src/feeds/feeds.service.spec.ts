import { ConflictException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { RssParserService } from '../rss/rss-parser.service';
import { Feed } from './feed.entity';
import { FeedsService } from './feeds.service';

describe('FeedsService', () => {
  const feeds = {
    create: jest.fn((value) => value),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };
  const rss = {
    assertValidFeed: jest.fn(),
  };

  const service = new FeedsService(
    feeds as unknown as Repository<Feed>,
    rss as unknown as RssParserService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects an invalid rss url before save', async () => {
    rss.assertValidFeed.mockRejectedValue(new Error('parse'));
    await expect(
      service.create('u1', { url: 'https://example.com/not-rss' }),
    ).rejects.toThrow('parse');
    expect(feeds.save).not.toHaveBeenCalled();
  });

  it('saves title from the parsed feed', async () => {
    rss.assertValidFeed.mockResolvedValue({ title: 'HN', items: [] });
    feeds.save.mockImplementation(async (row) => row);
    await expect(
      service.create('u1', { url: 'https://hnrss.org/newest' }),
    ).resolves.toMatchObject({
      userId: 'u1',
      url: 'https://hnrss.org/newest',
      title: 'HN',
    });
  });

  it('maps unique violation to ConflictException', async () => {
    rss.assertValidFeed.mockResolvedValue({ title: 'HN', items: [] });
    const error = new QueryFailedError('', [], new Error('dup'));
    (error as QueryFailedError & { code: string }).code = '23505';
    feeds.save.mockRejectedValue(error);
    await expect(
      service.create('u1', { url: 'https://hnrss.org/newest' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
