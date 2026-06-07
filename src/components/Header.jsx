import { NavLink, Link } from 'react-router-dom';

const LINKS = [
  { to: '/mountains', label: '산 목록' },
  { to: '/board', label: '자유게시판' },
  { to: '/suggestions', label: '건의게시판' },
  { to: '/mypage', label: '마이페이지' },
];

export default function Header() {
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
        <Link className="btn ghost" to="/login">로그인</Link>
        <Link className="btn pop" to="/signup">회원가입</Link>
      </div>
    </header>
  );
}
