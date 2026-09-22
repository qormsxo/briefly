import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './layout/AppLayout';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { HistoryPage } from './pages/HistoryPage';
// RSS 피드 화면은 잠시 비활성화. 다시 켤 때 import와 아래 라우트 주석을 푼다.
// import { FeedsPage } from './pages/FeedsPage';
import { LoginPage } from './pages/LoginPage';
import { ThemesPage } from './pages/ThemesPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<ThemesPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          {/* <Route path="/feeds" element={<FeedsPage />} /> */}
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
