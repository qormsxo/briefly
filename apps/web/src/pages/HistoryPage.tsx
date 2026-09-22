import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ingestArticles, listArticles } from '../articles/api';
import { ApiError } from '../lib/http';
import { queryClient } from '../lib/query-client';
import { listThemes, saveThemes } from '../themes/api';

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const themes = useQuery({ queryKey: ['themes'], queryFn: listThemes });
  const saveMutation = useMutation({
    mutationFn: saveThemes,
    onSuccess: (data) => {
      queryClient.setQueryData(['themes'], data);
    },
  });
  const ingestMutation = useMutation({
    mutationFn: ingestArticles,
    onSuccess: async () => {
      setPage(1);
      await queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
  const history = useQuery({
    queryKey: ['articles', page],
    queryFn: () => listArticles(page),
    refetchInterval: ingestMutation.isPending ? 1500 : false,
  });

  const selected = new Set(themes.data?.selected ?? []);
  const items = history.data?.items ?? [];
  const ingestResult = ingestMutation.data;
  const saveError =
    saveMutation.error instanceof ApiError
      ? saveMutation.error.message
      : saveMutation.isError
        ? '저장에 실패했습니다'
        : null;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    saveMutation.mutate([...next]);
  }

  return (
    <section>
      <h2 className="text-base font-semibold">관심 뉴스</h2>
      <p className="mt-2 text-sm text-slate-600">
        보고 싶은 분야만 고르면 됩니다. 네이버, 다음, 구글 뉴스에서 찾아서
        요약합니다.
      </p>
      {themes.isLoading ? (
        <p className="mt-6 text-sm text-slate-500">분야를 불러오는 중...</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {themes.data?.catalog.map((theme) => {
          const on = selected.has(theme.id);
          return (
            <button
              key={theme.id}
              type="button"
              disabled={saveMutation.isPending}
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

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-base font-semibold">요약 히스토리</h2>
        <button
          type="button"
          disabled={ingestMutation.isPending}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          onClick={() => ingestMutation.mutate()}
        >
          {ingestMutation.isPending ? '수집 중...' : '지금 수집'}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        수집이 끝나면, 아직 안 보낸 요약을 글마다 카카오톡으로 보내고 원문
        링크도 같이 넣습니다.
      </p>
      {ingestMutation.isPending ? (
        <p className="mt-2 text-sm text-slate-500">
          요약이 끝나는 대로 아래에 추가됩니다.
        </p>
      ) : null}
      {ingestResult && !ingestMutation.isPending ? (
        <p className="mt-2 text-sm text-slate-600">
          새로 요약 {ingestResult.count}건, 카카오톡 {ingestResult.sent}건
          {ingestResult.kakaoError ? ` (발송 실패: ${ingestResult.kakaoError})` : ''}
        </p>
      ) : null}

      {history.isLoading ? (
        <p className="mt-6 text-sm text-slate-500">불러오는 중...</p>
      ) : null}
      {history.data && items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">아직 요약이 없습니다.</p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {items.map((article) => (
          <li
            key={article.id}
            className="rounded border border-slate-200 bg-white p-4"
          >
            <p className="text-xs text-slate-500">
              {article.theme
                ? article.feedTitle ?? article.theme
                : article.feedTitle ?? article.feedUrl ?? '피드'}
            </p>
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-900 hover:underline"
            >
              {article.title}
            </a>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(article.collectedAt).toLocaleString()}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
              {article.summary}
            </p>
          </li>
        ))}
      </ul>

      {history.data && history.data.total > 0 ? (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <button
            type="button"
            disabled={page <= 1}
            className="disabled:opacity-40"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            이전
          </button>
          <span>
            {page} / {Math.max(1, Math.ceil(history.data.total / history.data.limit))}
          </span>
          <button
            type="button"
            disabled={!history.data.hasMore}
            className="disabled:opacity-40"
            onClick={() => setPage((current) => current + 1)}
          >
            다음
          </button>
        </div>
      ) : null}
    </section>
  );
}
