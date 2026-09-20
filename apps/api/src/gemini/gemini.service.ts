import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_SOURCE_CHARS = 8_000;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(config: ConfigService) {
    this.client = new GoogleGenerativeAI(config.getOrThrow('GEMINI_API_KEY'));
    this.modelName = config.get('GEMINI_MODEL') ?? 'gemini-2.0-flash';
  }

  async summarize(title: string, source: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const clipped = source.slice(0, MAX_SOURCE_CHARS);
    const prompt = [
      '다음 글을 한국어 3줄로 요약해.',
      '불릿, 번호, 머리말 없이 줄바꿈으로만 구분해.',
      '',
      `제목: ${title}`,
      '',
      clipped,
    ].join('\n');

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (!text) {
      this.logger.warn(`빈 요약 title=${title}`);
      throw new Error('Gemini 요약 결과가 비어 있습니다');
    }
    return text;
  }
}
