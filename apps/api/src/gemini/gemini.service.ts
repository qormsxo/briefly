import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { withRetry } from '../common/retry';

/** gemini-3.6-flash 입력 한도. https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash */
const MODEL_INPUT_TOKEN_LIMIT = 1_048_576;
/**
 * 3줄 요약에는 기사 앞부분이면 충분하다.
 * 한글은 대략 글자 1개당 토큰 1개라, 4,000자는 모델 한도보다 훨씬 짧다.
 */
const MAX_SOURCE_CHARS = Math.min(4_000, MODEL_INPUT_TOKEN_LIMIT);

export type ArticleBrief = {
  title: string;
  summary: string;
  interest: number;
};

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(config: ConfigService) {
    this.client = new GoogleGenerativeAI(config.getOrThrow('GEMINI_API_KEY'));
    this.modelName = config.get('GEMINI_MODEL') ?? 'gemini-3.6-flash';
  }

  async summarize(title: string, source: string): Promise<ArticleBrief> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const clipped = source.slice(0, MAX_SOURCE_CHARS);
    const prompt = [
      '아래 글을 한국어로 정리해.',
      'JSON만 출력하고 코드블록은 쓰지 마.',
      '{"title":"손이 가게 만드는 한국어 제목","summary":"세 줄 요약. 줄바꿈 구분. 전체 160자 이내","interest":8}',
      'interest는 1-10. 자극적이고 화제성 있는 뉴스일수록 높게. 거짓 과장 금지.',
      '',
      `원제: ${title}`,
      '',
      clipped,
    ].join('\n');

    const result = await withRetry(
      `Gemini 요약 title=${title}`,
      () => model.generateContent(prompt),
      { logger: this.logger },
    );
    const text = result.response.text().trim();
    return this.parseBrief(text, title);
  }

  async rankByInterest(
    items: { title: string; lead: string }[],
  ): Promise<number[]> {
    if (items.length <= 1) {
      return items.map((_, index) => index);
    }
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const lines = items.map((item, index) => {
      const lead = item.lead.replace(/\s+/g, ' ').trim().slice(0, 160);
      return `${index}. ${item.title}\n${lead}`;
    });
    const prompt = [
      '아래 뉴스를 자극적이고 화제성 있는 순으로 점수를 매겨.',
      'JSON만 출력하고 코드블록은 쓰지 마.',
      `{"scores":[${items.map(() => 5).join(',')}]}`,
      'scores 길이는 후보 수와 같아야 하고, 순서는 입력 순서를 유지해.',
      '점수는 1-10. 재미와 화제성이 높을수록 높게. 거짓 과장 금지.',
      '',
      lines.join('\n\n'),
    ].join('\n');

    const result = await withRetry(
      `Gemini 흥미 순위 count=${items.length}`,
      () => model.generateContent(prompt),
      { logger: this.logger },
    );
    const text = result.response.text().trim();
    const scores = parseInterestScores(text, items.length);
    if (!scores) {
      throw new Error('흥미 순위 JSON 파싱 실패');
    }
    return orderByInterestScores(scores);
  }

  private parseBrief(raw: string, fallbackTitle: string): ArticleBrief {
    const jsonText = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    try {
      const parsed = JSON.parse(jsonText) as {
        title?: unknown;
        summary?: unknown;
        interest?: unknown;
      };
      const translated =
        typeof parsed.title === 'string' ? parsed.title.trim() : '';
      const summary =
        typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
      if (!summary) {
        throw new Error('empty summary');
      }
      return {
        title: translated || fallbackTitle,
        summary,
        interest: clampInterest(parsed.interest),
      };
    } catch {
      this.logger.warn('Gemini JSON 파싱 실패, 원제목 + 본문 사용');
      return { title: fallbackTitle, summary: jsonText, interest: 5 };
    }
  }
}

export function parseInterestScores(
  raw: string,
  count: number,
): number[] | null {
  const jsonText = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  try {
    const parsed = JSON.parse(jsonText) as { scores?: unknown };
    if (!Array.isArray(parsed.scores) || parsed.scores.length !== count) {
      return null;
    }
    return parsed.scores.map((score) => {
      const value = typeof score === 'number' ? score : Number(score);
      return Number.isFinite(value) ? value : 0;
    });
  } catch {
    return null;
  }
}

export function orderByInterestScores(scores: number[]): number[] {
  return scores
    .map((score, index) => ({ score, index }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((item) => item.index);
}

function clampInterest(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 5;
  }
  return Math.min(10, Math.max(1, Math.round(parsed)));
}
