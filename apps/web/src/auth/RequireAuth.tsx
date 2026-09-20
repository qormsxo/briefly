import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './use-auth';

export function RequireAuth() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <p className="px-6 py-10 text-sm text-slate-500">로그인 확인 중...</p>
    );
  }

  if (auth.isError || !auth.data) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
