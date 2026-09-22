import { BadRequestException } from '@nestjs/common';
import { assertPublicHttpUrl } from './public-url';

describe('assertPublicHttpUrl', () => {
  it('accepts a public https url', () => {
    expect(() => assertPublicHttpUrl('https://openai.com/blog')).not.toThrow();
  });

  it('rejects localhost and private ips', () => {
    expect(() => assertPublicHttpUrl('http://localhost:3000')).toThrow(
      BadRequestException,
    );
    expect(() => assertPublicHttpUrl('http://192.168.0.10')).toThrow(
      BadRequestException,
    );
    expect(() => assertPublicHttpUrl('http://10.0.0.5/x')).toThrow(
      BadRequestException,
    );
  });

  it('rejects non-http schemes', () => {
    expect(() => assertPublicHttpUrl('ftp://example.com/a')).toThrow(
      BadRequestException,
    );
  });
});
