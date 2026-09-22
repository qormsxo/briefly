import {
  extractArticle,
  extractListingLinks,
  extractSiteTitle,
  isFeedContentType,
  isHtmlContentType,
  resolveHref,
} from './html-extract';

const listingHtml = `
  <html>
    <head>
      <title>Dev Blog</title>
      <meta property="og:site_name" content="Dev Blog" />
    </head>
    <body>
      <nav><a href="/about">About</a><a href="/login">Login</a></nav>
      <main>
        <article>
          <a href="/posts/hello-world">Hello world post</a>
          <a href="/posts/research-notes">Research notes article title</a>
        </article>
        <a href="https://other.com/posts/x">External</a>
        <a href="/logo.png">asset</a>
      </main>
    </body>
  </html>
`;

const articleHtml = `
  <html>
    <head>
      <meta property="og:title" content="Hello world" />
      <meta property="article:published_time" content="2026-09-20T00:00:00.000Z" />
    </head>
    <body>
      <article>
        <h1>Hello world</h1>
        <p>This is the first paragraph of the article with enough characters to keep.</p>
        <p>This is the second paragraph of the article with enough characters as well.</p>
      </article>
    </body>
  </html>
`;

describe('html-extract', () => {
  it('resolves relative href against the page url', () => {
    expect(resolveHref('/posts/a', 'https://example.com/blog')).toBe(
      'https://example.com/posts/a',
    );
  });

  it('picks same-site article links and skips nav/assets', () => {
    expect(
      extractListingLinks(listingHtml, 'https://example.com/blog'),
    ).toEqual([
      'https://example.com/posts/research-notes',
      'https://example.com/posts/hello-world',
    ]);
  });

  it('reads site title from og:site_name', () => {
    expect(extractSiteTitle(listingHtml, 'https://example.com')).toBe(
      'Dev Blog',
    );
  });

  it('extracts title, body, and published time', () => {
    const article = extractArticle(articleHtml, 'https://example.com/posts/a');
    expect(article.title).toBe('Hello world');
    expect(article.text).toContain('first paragraph');
    expect(article.publishedAt?.toISOString()).toBe(
      '2026-09-20T00:00:00.000Z',
    );
  });

  it('detects html vs feed content types', () => {
    expect(isHtmlContentType('text/html; charset=utf-8')).toBe(true);
    expect(isFeedContentType('application/rss+xml')).toBe(true);
    expect(isFeedContentType('application/xhtml+xml')).toBe(false);
  });
});
