import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useEffect, lazy, Suspense } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import MainPage from './pages/MainPage.jsx';
import MountainListPage from './pages/MountainListPage.jsx';
import MountainDetailPage from './pages/MountainDetailPage.jsx';
import FreeBoardPage from './pages/FreeBoardPage.jsx';
import BoardDetailPage from './pages/BoardDetailPage.jsx';
import SuggestionBoardPage from './pages/SuggestionBoardPage.jsx';
import MyPage from './pages/MyPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminFormPage from './pages/AdminFormPage.jsx';
import AdminRouteBulkPage from './pages/AdminRouteBulkPage.jsx';
// 엑셀 파서(xlsx)가 무거워 이 페이지만 지연 로딩(code-split) → 일반 사용자 번들에서 제외
const AdminMountainBulkPage = lazy(() => import('./pages/AdminMountainBulkPage.jsx'));
import PostWritePage from './pages/PostWritePage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import GpxGuidePage from './pages/GpxGuidePage.jsx';
import ProfileEditPage from './pages/ProfileEditPage.jsx';

// 라우트 정의. 어드민은 자체 레이아웃을 쓰므로 공통 Header/Footer를 끼지 않는다.
export default function App() {
  const { pathname } = useLocation();
  const { initializing, user } = useAuth();
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'admin';
  const isAuth = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password';
  // 산 상세는 지도 풀스크린 레이아웃이라 푸터를 숨긴다
  const isDetail = /^\/mountains\/[^/]+$/.test(pathname);

  // Hook은 조건부 return 앞에 있어야 한다
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // 쿠키로 로그인 상태 확인 전에 렌더하면 Header가 깜빡임 → 확인 완료까지 대기
  if (initializing) return null;

  // 관리자 페이지: ADMIN role 없으면 홈으로 리다이렉트
  if (isAdminPath) {
    if (!isAdminUser) return <MainPage />;
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/routes/bulk" element={<AdminRouteBulkPage />} />
        <Route path="/admin/mountains/bulk" element={
          <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>불러오는 중…</div>}>
            <AdminMountainBulkPage />
          </Suspense>
        } />
        <Route path="/admin/:tab/new" element={<AdminFormPage />} />
        <Route path="/admin/:tab/:id/edit" element={<AdminFormPage />} />
        <Route path="/admin/:tab" element={<AdminPage />} />
      </Routes>
    );
  }

  // 로그인/회원가입은 전체화면(헤더·푸터 없이)
  if (isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/mountains" element={<MountainListPage />} />
          <Route path="/mountains/:id" element={<MountainDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/board" element={<FreeBoardPage />} />
          <Route path="/board/write" element={<PostWritePage />} />
          <Route path="/board/:id" element={<BoardDetailPage />} />
          <Route path="/board/:id/edit" element={<PostWritePage />} />
          <Route path="/suggestions" element={<SuggestionBoardPage />} />
          <Route path="/suggestions/write" element={<PostWritePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/edit" element={<ProfileEditPage />} />
          <Route path="/gpx" element={<GpxGuidePage />} />
          <Route path="*" element={<MainPage />} />
        </Routes>
      </main>
      {!isDetail && <Footer />}
    </div>
  );
}
