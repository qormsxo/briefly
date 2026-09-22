import { Navigate } from 'react-router-dom';
import { startKakaoLogin } from '../auth/api';
import { useAuth } from '../auth/use-auth';

export function LoginPage() {
  const auth = useAuth();

  if (auth.data) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F1218] px-6 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-28 -top-36 h-[32rem] w-[32rem] rounded-full bg-teal-400/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0F1218_78%)]"
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-zinc-950/75 px-8 py-10 shadow-2xl shadow-black/50 ring-1 ring-white/10 backdrop-blur-md">
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-50">feed-briefly</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          관심 분야를 고르면, 뉴스를 짧게 요약해 매일 아침 카카오톡으로 보내 드립니다.
        </p>
        <button
          type="button"
          className="mt-8 w-full rounded-lg bg-[#FEE500] px-4 py-2.5 text-sm font-medium text-[#191919] hover:bg-[#f6dc00]"
          onClick={startKakaoLogin}
        >
          카카오 로그인
        </button>
      </div>
    </div>
  );
}
