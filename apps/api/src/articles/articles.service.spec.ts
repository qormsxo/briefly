import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { ArticlesService } from './articles.service';

describe('ArticlesService', () => {
  const articles = {
    findAndCount: jest.fn(),
    find: jest.fn(),
  };

  const service = new ArticlesService(
    articles as unknown as Repository<Article>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('paginates and reports hasMore', async () => {
    articles.findAndCount.mockResolvedValue([
      [
        { id: 'a1', feed: { title: 'HN', url: 'https://hnrss.org/frontpage' } },
        { id: 'a2', feed: { title: 'DEV', url: 'https://dev.to/feed' } },
      ],
      5,
    ]);
    await expect(service.paginateByUser('u1', 1, 2)).resolves.toMatchObject({
      items: [
        { id: 'a1', feedTitle: 'HN' },
        { id: 'a2', feedTitle: 'DEV' },
      ],
      page: 1,
      limit: 2,
      total: 5,
      hasMore: true,
    });
    expect(articles.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 2 }),
    );
  });

  it('sets hasMore false on the last page', async () => {
    articles.findAndCount.mockResolvedValue([[{ id: 'a3' }], 3]);
    await expect(service.paginateByUser('u1', 2, 2)).resolves.toMatchObject({
      hasMore: false,
      page: 2,
    });
  });
});
