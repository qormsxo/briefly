import { http } from '../lib/http';

export type NewsThemeOption = {
  id: string;
  label: string;
};

export type UserThemes = {
  catalog: NewsThemeOption[];
  selected: string[];
};

export function listThemes() {
  return http<UserThemes>('/api/themes');
}

export function saveThemes(themeIds: string[]) {
  return http<UserThemes>('/api/themes', {
    method: 'PUT',
    body: JSON.stringify({ themeIds }),
  });
}
