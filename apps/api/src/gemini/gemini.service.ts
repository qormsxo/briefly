import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { withRetry } from '../common/retry';

const MAX_SOURCE_CHARS = 8_000;

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

function clampInterest(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return 5;
  }
  return Math.min(10, Math.max(1, Math.round(parsed)));
}
