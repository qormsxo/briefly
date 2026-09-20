import { buildKakaoText, KAKAO_TEXT_MAX, sortByInterest } from './kakao-text';

describe('kakao-text', () => {
  it('orders highest interest first', () => {
    const picked = sortByInterest([
      { interest: 4, collectedAt: new Date('2026-09-20T10:00:00Z') },
      { interest: 9, collectedAt: new Date('2026-09-20T09:00:00Z') },
      { interest: 9, collectedAt: new Date('2026-09-20T11:00:00Z') },
      { interest: 2, collectedAt: new Date('2026-09-20T12:00:00Z') },
    ]);

    expect(picked.map((item) => item.interest)).toEqual([9, 9, 4, 2]);
    expect(picked[0].collectedAt.toISOString()).toBe('2026-09-20T11:00:00.000Z');
  });

  it('appends the original url and stays within kakao text limit', () => {
    const url = 'https://example.com/article';
    const text = buildKakaoText('제목', '한 줄\n두 줄\n세 줄', url);
    expect(text).toBe(`제목\n\n한 줄\n두 줄\n세 줄\n\n${url}`);
    expect(text.length).toBeLessThanOrEqual(KAKAO_TEXT_MAX);
    expect(text.endsWith(url)).toBe(true);

    const long = buildKakaoText('제목', '가'.repeat(400), url);
    expect(long.length).toBeLessThanOrEqual(KAKAO_TEXT_MAX);
    expect(long.startsWith('제목\n\n')).toBe(true);
    expect(long.endsWith(url)).toBe(true);
  });
});
