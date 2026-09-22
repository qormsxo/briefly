import { useMutation, useQuery } from '@tanstack/react-query';
import { listThemes, saveThemes } from '../themes/api';
import { ApiError } from '../lib/http';
import { queryClient } from '../lib/query-client';

export function ThemesPage() {
  const themes = useQuery({ queryKey: ['themes'], queryFn: listThemes });

  const saveMutation = useMutation({
    mutationFn: saveThemes,
    onSuccess: async (data) => {
      queryClient.setQueryData(['themes'], data);
    },
  });

  const selected = new Set(themes.data?.selected ?? []);
  const pending = saveMutation.isPending;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    saveMutation.mutate([...next]);
  }

  const saveError =
    saveMutation.error instanceof ApiError
      ? saveMutation.error.message
      : saveMutation.isError
        ? '저장에 실패했습니다'
        : null;

  return (
    <section>
      <h2 className="text-base font-semibold">관심 뉴스</h2>
      <p className="mt-2 text-sm text-slate-600">
        보고 싶은 분야만 고르면 됩니다. 글 주소를 복사할 필요 없고, 네이버,
        다음, 구글 뉴스에서 찾아서 요약합니다.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        수집은 히스토리의 지금 수집, 또는 매일 아침 크론에서 돌아갑니다.
      </p>

      {themes.isLoading ? (
        <p className="mt-6 text-sm text-slate-500">불러오는 중...</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {themes.data?.catalog.map((theme) => {
          const on = selected.has(theme.id);
          return (
            <button
              key={theme.id}
              type="button"
              disabled={pending}
              className={`rounded-full border px-3 py-1.5 text-sm disabled:opacity-60 ${
                on
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
              onClick={() => toggle(theme.id)}
            >
              {theme.label}
            </button>
          );
        })}
      </div>

      {saveError ? (
        <p className="mt-3 text-sm text-red-600">{saveError}</p>
      ) : null}
      {selected.size === 0 && themes.data ? (
        <p className="mt-4 text-sm text-slate-500">
          아직 고른 분야가 없습니다. 하나 이상 선택하세요.
        </p>
      ) : null}
    </section>
  );
}
