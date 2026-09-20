import { http } from '../lib/http';

export type Feed = {
  id: string;
  url: string;
  title: string | null;
  createdAt: string;
};

export function listFeeds() {
  return http<Feed[]>('/api/feeds');
}

export function createFeed(url: string) {
  return http<Feed>('/api/feeds', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export function deleteFeed(id: string) {
  return http<{ ok: boolean }>(`/api/feeds/${id}`, { method: 'DELETE' });
}
