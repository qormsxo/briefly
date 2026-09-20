import { Navigate } from 'react-router-dom';
import { startKakaoLogin } from '../auth/api';
import { useAuth } from '../auth/use-auth';

export function LoginPage() {
  const auth = useAuth();

  if (auth.data) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8">
        <h1 className="text-xl font-semibold">feed-briefly</h1>
        <p className="mt-2 text-sm text-slate-600">
          RSS를 요약해 매일 아침 카카오톡으로 받습니다.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded bg-[#FEE500] px-4 py-2.5 text-sm font-medium text-[#191919] hover:bg-[#f6dc00]"
          onClick={startKakaoLogin}
        >
          카카오 로그인
        </button>
      </div>
    </div>
  );
}
