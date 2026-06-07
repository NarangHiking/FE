import { Link } from 'react-router-dom';

export const ADMIN_NAV = [
  { key: 'users', ico: '👤', label: '유저 관리' },
  { key: 'mountains', ico: '⛰', label: '산 관리' },
  { key: 'routes', ico: '🥾', label: '경로 관리' },
];

// 어드민 공통 레이아웃: 좌측 사이드바 + 상단바 + 콘텐츠.
// active: 현재 활성 nav key, title/sub: 상단 제목.
export default function AdminLayout({ active, title, sub, children }) {
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link className="a-brand" to="/">
          <span className="seal">⛰</span>
          <span><b>나랑등산이다</b><span className="lat">ADMIN CONSOLE</span></span>
        </Link>
        <div className="a-nav-lab">관리</div>
        {ADMIN_NAV.map((n) => (
          <Link key={n.key} to={`/admin/${n.key}`} className={'a-link' + (active === n.key ? ' on' : '')}>
            <span className="ico">{n.ico}</span>{n.label}
          </Link>
        ))}
        <div className="a-foot">
          <Link to="/">← 서비스로 돌아가기</Link>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>{title}</h1>
            <div className="sub">{sub}</div>
          </div>
          <div className="who">
            <span className="role admin">ADMIN</span>
            <span>관리자님</span>
            <span className="av">관</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
