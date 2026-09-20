import { useQuery } from '@tanstack/react-query';
import { fetchMe } from './api';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
  });
}
