import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/mountains', label: '산 목록' },
  { to: '/board', label: '커뮤니티' },
  { to: '/mypage', label: '마이페이지' },
];

export default function Header() {
  // useAuth() 로 현재 로그인 상태와 logout 함수 꺼내기
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();   // POST /api/auth/logout + localStorage 정리
    navigate('/');    // 홈으로
  };

  return (
    <header>
      <div className="wrap nav">
        <Link className="brand" to="/">
          <span className="seal">⛰</span>
          <span>
            <b>나랑등산이다</b>
            <span className="lat">NARANG · TRAIL CLUB</span>
          </span>
        </Link>
        <nav className="links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'on' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <span className="spacer" />

        {/* user 가 null 이면 비로그인, 있으면 로그인 상태 */}
        {user ? (
          <>
            <span>{user.name}</span>
            <button className="btn pop" type="button" onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <Link className="btn ghost" to="/login">로그인</Link>
            <Link className="btn pop" to="/signup">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}
