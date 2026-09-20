import { Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { KakaoApiClient } from './kakao-api.client';

export type KakaoFeedTemplate = {
  object_type: 'feed';
  content: {
    title: string;
    description: string;
    image_url: string;
    link: { web_url: string; mobile_web_url: string };
  };
  buttons?: Array<{
    title: string;
    link: { web_url: string; mobile_web_url: string };
  }>;
};

@Injectable()
export class KakaoTalkService {
  constructor(private readonly kakao: KakaoApiClient) {}

  sendMemoToMe(user: User, template: KakaoFeedTemplate) {
    const body = new URLSearchParams({
      template_object: JSON.stringify(template),
    });
    return this.kakao.request(user, {
      method: 'POST',
      url: '/v2/api/talk/memo/default/send',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body.toString(),
    });
  }
}
