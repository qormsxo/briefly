import { useMutation } from '@tanstack/react-query';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../auth/api';
import { useAuth } from '../auth/use-auth';
import { queryClient } from '../lib/query-client';

export function AppLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.clear();
      navigate('/login');
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          feed-briefly
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {/* RSS 피드 화면은 잠시 비활성화. App.tsx의 /feeds 라우트 주석과 같이 켠다.
          <Link to="/feeds" className="text-slate-600 hover:text-slate-900">
            피드
          </Link>
          */}
          <Link to="/themes" className="text-slate-600 hover:text-slate-900">
            테마
          </Link>
          <Link to="/history" className="text-slate-600 hover:text-slate-900">
            히스토리
          </Link>
          <span className="text-slate-400">
            {auth.data?.nickname ?? '사용자'}
          </span>
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-100"
            onClick={() => logoutMutation.mutate()}
          >
            로그아웃
          </button>
        </nav>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
