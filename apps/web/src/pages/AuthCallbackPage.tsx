import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/use-auth';

export function AuthCallbackPage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <p className="px-6 py-10 text-sm text-slate-500">로그인 처리 중...</p>
    );
  }

  if (auth.isError || !auth.data) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/" replace />;
}
