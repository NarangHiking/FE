import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout, { ADMIN_NAV } from '../components/AdminLayout.jsx';
import { apiFetch } from '../context/AuthContext.jsx';

export default function AdminPage() {
  const { tab = 'users' } = useParams();
  const current = ADMIN_NAV.some((n) => n.key === tab) ? tab : 'users';

  const TITLES = {
    users:     { h: '유저 관리',  sub: 'USER MANAGEMENT' },
    mountains: { h: '산 관리',   sub: 'MOUNTAIN MANAGEMENT' },
    routes:    { h: '경로 관리', sub: 'ROUTE MANAGEMENT' },
  };
  const t = TITLES[current];

  // ── 각 탭 데이터 상태 ────────────────────────────────────
  const [users,     setUsers]     = useState([]);
  const [mountains, setMountains] = useState([]);
  const [tracks,    setTracks]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetches = {
      users:     () => apiFetch('/api/user/list').then(r => r.json()).then(j => setUsers(j.data ?? j)),
      mountains: () => apiFetch('/api/mtn/list').then(r => r.json()).then(j => setMountains(j.data ?? j)),
      routes:    () => apiFetch('/api/track').then(r => r.json()).then(j => setTracks(j.data ?? j)),
    };
    fetches[current]?.()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [current]);

  // ── 삭제 핸들러 ──────────────────────────────────────────
  async function deleteMtn(id) {
    if (!window.confirm('산을 삭제하시겠습니까?')) return;
    const res = await apiFetch(`/api/mtn/${id}`, { method: 'DELETE' });
    if (res.ok) setMountains(prev => prev.filter(m => m.id !== id));
    else alert('삭제 실패');
  }

  async function deleteTrack(id) {
    if (!window.confirm('경로를 삭제하시겠습니까?')) return;
    const res = await apiFetch(`/api/track/${id}`, { method: 'DELETE' });
    if (res.ok) setTracks(prev => prev.filter(t => t.id !== id));
    else alert('삭제 실패');
  }

  // ── KPI (목록 length 기반) ───────────────────────────────
  const kpis = [
    { k: '전체 유저',   v: users.length     || '-' },
    { k: '등록 산',     v: mountains.length || '-' },
    { k: '등록 경로',   v: tracks.length    || '-' },
  ];

  return (
    <AdminLayout active={current} title={t.h} sub={t.sub}>
      <div className="kpi-row">
        {kpis.map((k) => (
          <div className="kpi" key={k.k}>
            <div className="k">{k.k}</div>
            <div className="v">{k.v}</div>
          </div>
        ))}
      </div>

      {loading && <p style={{ padding: 40, textAlign: 'center' }}>불러오는 중…</p>}

      {!loading && current === 'users'     && <UsersTable     users={users} />}
      {!loading && current === 'mountains' && <MountainsTable mountains={mountains} onDelete={deleteMtn} />}
      {!loading && current === 'routes'    && <RoutesTable    tracks={tracks}       onDelete={deleteTrack} />}
    </AdminLayout>
  );
}

// ── 공통 페이지네이션 ────────────────────────────────────────
const PAGE_SIZE = 10; // 한 페이지에 표시할 행 수

function usePaged(items) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const cur = Math.min(page, totalPages); // 데이터가 줄어 범위를 벗어나면 보정
  const offset = (cur - 1) * PAGE_SIZE;
  return { page: cur, setPage, totalPages, offset, pageItems: items.slice(offset, offset + PAGE_SIZE) };
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null; // 1페이지면 숨김
  const nums = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);
  return (
    <div className="pagination" style={{ margin: '16px 0 4px' }}>
      <span className={'pg ghost' + (page === 1 ? ' disabled' : '')} onClick={() => page > 1 && onPage(page - 1)}>←</span>
      {nums.map((n) => (
        <span key={n} className={'pg' + (n === page ? ' on' : '')} onClick={() => onPage(n)}>{n}</span>
      ))}
      <span className={'pg ghost' + (page === totalPages ? ' disabled' : '')} onClick={() => page < totalPages && onPage(page + 1)}>→</span>
    </div>
  );
}

// ── 공통 헤더 ───────────────────────────────────────────────
function DataHead({ title, action, to, extra }) {
  return (
    <div className="dc-head">
      <h2>{title}</h2>
      <div className="tools">
        <div className="search-mini"><span>🔍</span><input placeholder="검색" /></div>
        {extra}
        <Link className="btn pop sm" to={to}>{action}</Link>
      </div>
    </div>
  );
}

// ── 유저 테이블 ─────────────────────────────────────────────
function UsersTable({ users }) {
  const { page, setPage, totalPages, offset, pageItems } = usePaged(users);
  return (
    <div className="data-card">
      <DataHead title="유저 목록" action="+ 유저 등록" to="/admin/users/new" />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>이름</th><th className="hide-sm">이메일</th>
            <th>권한</th><th className="hide-sm">가입일</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((u, i) => (
            <tr key={u.email ?? i}>
              <td className="id">{offset + i + 1}</td>
              <td><div className="uname"><span className="av">{u.name?.[0]}</span>{u.name}</div></td>
              <td className="hide-sm id">{u.email}</td>
              <td><span className={'role ' + (u.role?.toLowerCase())}>{u.role}</span></td>
              <td className="hide-sm id">{u.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

// ── 산 테이블 ───────────────────────────────────────────────
function MountainsTable({ mountains, onDelete }) {
  const { page, setPage, totalPages, pageItems } = usePaged(mountains);
  return (
    <div className="data-card">
      <DataHead title="산 목록" action="+ 산 등록" to="/admin/mountains/new"
        extra={<Link className="btn sm" to="/admin/mountains/bulk">⬆ 엑셀 등록</Link>} />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>산 이름</th><th className="hide-sm">지역</th>
            <th>고도</th><th>관리</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((m) => (
            <tr key={m.id}>
              <td className="id">{m.id}</td>
              <td style={{ fontWeight: 700 }}>{m.name}</td>
              <td className="hide-sm">{m.location}</td>
              <td>{m.height}m</td>
              <td>
                <div className="row-actions">
                  <Link className="icon-btn" title="수정" to={`/admin/mountains/${m.id}/edit`}>✎</Link>
                  <button className="icon-btn danger" title="삭제" onClick={() => onDelete(m.id)}>🗑</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}

// ── 경로 테이블 ─────────────────────────────────────────────
function RoutesTable({ tracks, onDelete }) {
  const { page, setPage, totalPages, pageItems } = usePaged(tracks);
  return (
    <div className="data-card">
      <DataHead title="경로 목록" action="+ 경로 등록" to="/admin/routes/new"
        extra={<Link className="btn sm" to="/admin/routes/bulk">⬆ 일괄 등록</Link>} />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>경로명</th><th className="hide-sm">산 ID</th>
            <th className="hide-sm">GPX</th><th>추천수</th><th>관리</th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((r) => (
            <tr key={r.id}>
              <td className="id">{r.id}</td>
              <td>{r.name}</td>
              <td className="hide-sm">{r.mountainId}</td>
              <td className="hide-sm id">{r.gpxFilePath ?? '-'}</td>
              <td>{r.recommendCnt ?? 0}</td>
              <td>
                <div className="row-actions">
                  <Link className="icon-btn" title="수정" to={`/admin/routes/${r.id}/edit`}>✎</Link>
                  <button className="icon-btn danger" title="삭제" onClick={() => onDelete(r.id)}>🗑</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPage={setPage} />
    </div>
  );
}
