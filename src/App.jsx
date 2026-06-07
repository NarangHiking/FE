import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import MainPage from './pages/MainPage.jsx';
import MountainListPage from './pages/MountainListPage.jsx';
import MountainDetailPage from './pages/MountainDetailPage.jsx';
import FreeBoardPage from './pages/FreeBoardPage.jsx';
import SuggestionBoardPage from './pages/SuggestionBoardPage.jsx';
import MyPage from './pages/MyPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminFormPage from './pages/AdminFormPage.jsx';
import PostWritePage from './pages/PostWritePage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import GpxGuidePage from './pages/GpxGuidePage.jsx';

// 라우트 정의. 어드민은 자체 레이아웃을 쓰므로 공통 Header/Footer를 끼지 않는다.
export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/signup';

  // 페이지 이동 시 항상 상단으로
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
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
      </Routes>
    );
  }

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/mountains" element={<MountainListPage />} />
          <Route path="/mountains/:id" element={<MountainDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/board" element={<FreeBoardPage />} />
          <Route path="/board/write" element={<PostWritePage />} />
          <Route path="/suggestions" element={<SuggestionBoardPage />} />
          <Route path="/suggestions/write" element={<PostWritePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/gpx" element={<GpxGuidePage />} />
          <Route path="*" element={<MainPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
