import { Link, useParams } from 'react-router-dom';
import AdminLayout, { ADMIN_NAV } from '../components/AdminLayout.jsx';
import { ADMIN_USERS, ADMIN_MOUNTAINS, ADMIN_ROUTES, ADMIN_KPIS } from '../data/admin.js';

const TITLES = {
  users: { h: '유저 관리', sub: 'USER MANAGEMENT · 4,128명' },
  mountains: { h: '산 관리', sub: 'MOUNTAIN MANAGEMENT · 369개' },
  routes: { h: '경로 관리', sub: 'ROUTE MANAGEMENT · 1,284개' },
};

function lvClass(lv) {
  return lv === '상급' ? 'pop' : lv === '중급' ? '' : 'green';
}

export default function AdminPage() {
  const { tab = 'users' } = useParams();
  const current = ADMIN_NAV.some((n) => n.key === tab) ? tab : 'users';
  const t = TITLES[current];
  // TODO(BE): 관리자 권한 가드 — 로그인 유저 role !== 'ADMIN' 이면 접근 차단.
  // TODO(BE): 목록 조회 — 유저: GET /user/list · 산: GET /mtn/list · 경로: GET /track (전체).
  //   각 테이블의 삭제 버튼 → DELETE /mtn/{id} · DELETE /track/{id} · PATCH /user/remove.
  //   KPI 숫자도 각 목록 length 또는 별도 통계 API 로 교체.

  return (
    <AdminLayout active={current} title={t.h} sub={t.sub}>
      <div className="kpi-row">
        {ADMIN_KPIS.map((k) => (
          <div className="kpi" key={k.k}>
            <div className="k">{k.k}</div>
            <div className="v">{k.v}</div>
            <div className={'delta ' + k.dir}>{k.delta} 이번 주</div>
          </div>
        ))}
      </div>

      {current === 'users' && <UsersTable />}
      {current === 'mountains' && <MountainsTable />}
      {current === 'routes' && <RoutesTable />}
    </AdminLayout>
  );
}

function DataHead({ title, action, to }) {
  return (
    <div className="dc-head">
      <h2>{title}</h2>
      <div className="tools">
        <div className="search-mini"><span>🔍</span><input placeholder="검색" /></div>
        <Link className="btn pop sm" to={to}>{action}</Link>
      </div>
    </div>
  );
}

function UsersTable() {
  return (
    <div className="data-card">
      <DataHead title="유저 목록" action="+ 유저 등록" to="/admin/users/new" />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>유저</th><th className="hide-sm">이메일</th><th>권한</th>
            <th className="hide-sm">작성글</th><th className="hide-sm">가입일</th><th>관리</th>
          </tr>
        </thead>
        <tbody>
          {ADMIN_USERS.map((u) => (
            <tr key={u.id}>
              <td className="id">{u.id}</td>
              <td><div className="uname"><span className="av">{u.name[0]}</span>{u.name}</div></td>
              <td className="hide-sm id">{u.email}</td>
              <td><span className={'role ' + u.role}>{u.roleLabel}</span></td>
              <td className="hide-sm">{u.posts}</td>
              <td className="hide-sm id">{u.joined}</td>
              <td>
                <div className="row-actions">
                  <Link className="icon-btn" title="수정" to={`/admin/users/${u.id}/edit`}>✎</Link>
                  <button className="icon-btn danger" title="정지/삭제">⛔</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MountainsTable() {
  return (
    <div className="data-card">
      <DataHead title="산 목록" action="+ 산 등록" to="/admin/mountains/new" />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>산 이름</th><th className="hide-sm">지역</th><th>고도</th>
            <th className="hide-sm">경로 수</th><th>상태</th><th className="hide-sm">수정일</th><th>관리</th>
          </tr>
        </thead>
        <tbody>
          {ADMIN_MOUNTAINS.map((m) => (
            <tr key={m.id}>
              <td className="id">{m.id}</td>
              <td style={{ fontWeight: 700 }}>{m.name}</td>
              <td className="hide-sm">{m.region}</td>
              <td>{m.ele}m</td>
              <td className="hide-sm">{m.routes}</td>
              <td>
                <span className={'st-badge ' + (m.status === '공개' ? 'done' : m.status === '검수중' ? 'review' : 'reject')}>
                  {m.status}
                </span>
              </td>
              <td className="hide-sm id">{m.updated}</td>
              <td>
                <div className="row-actions">
                  <Link className="icon-btn" title="수정" to={`/admin/mountains/${m.id}/edit`}>✎</Link>
                  <button className="icon-btn danger" title="삭제">🗑</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoutesTable() {
  return (
    <div className="data-card">
      <DataHead title="경로 목록" action="+ 경로 등록" to="/admin/routes/new" />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>산</th><th>경로명</th><th>거리</th>
            <th>난이도</th><th className="hide-sm">GPX</th><th>상태</th><th>관리</th>
          </tr>
        </thead>
        <tbody>
          {ADMIN_ROUTES.map((r) => (
            <tr key={r.id}>
              <td className="id">{r.id}</td>
              <td style={{ fontWeight: 700 }}>{r.mountain}</td>
              <td>{r.name}</td>
              <td>{r.dist}</td>
              <td><span className={'tag ' + lvClass(r.lv)}>{r.lv}</span></td>
              <td className="hide-sm id">{r.gpx}</td>
              <td>
                <span className={'st-badge ' + (r.status === '공개' ? 'done' : 'review')}>{r.status}</span>
              </td>
              <td>
                <div className="row-actions">
                  <Link className="icon-btn" title="GPX 보기" to={`/admin/routes/${r.id}/edit`}>🗺</Link>
                  <Link className="icon-btn" title="수정" to={`/admin/routes/${r.id}/edit`}>✎</Link>
                  <button className="icon-btn danger" title="삭제">🗑</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
