import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import { apiFetch } from '../context/AuthContext.jsx';

// 경로 일괄 등록: GPX 여러 개를 한 번의 요청으로 POST /api/track/bulk 전송.
// tracks(JSON 배열) + files(같은 순서). BE가 트랜잭션 처리(하나라도 실패 시 전부 롤백).
const ST = { wait: 'wait', up: 'review', done: 'done', fail: 'reject' };
const ST_LABEL = { wait: '대기', up: '업로드중', done: '완료', fail: '실패' };
const PAGE_SIZE = 8; // 한 페이지에 표시할 행 수

export default function AdminRouteBulkPage() {
  const [mountains, setMountains] = useState([]);
  const [defaultMtn, setDefaultMtn] = useState('');
  const [rows, setRows] = useState([]); // {id, file, name, mountainId, status, msg}
  const [running, setRunning] = useState(false);
  const [page, setPage] = useState(1); // 현재 페이지 (1-based)

  useEffect(() => {
    apiFetch('/api/mtn/list')
      .then((r) => r.json())
      .then((j) => {
        const list = j.data ?? j;
        setMountains(list);
        if (list.length) setDefaultMtn(String(list[0].id));
      })
      .catch(() => {});
  }, []);

  const setRow = (id, patch) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  function addFiles(fileList) {
    const arr = Array.from(fileList).map((f, i) => ({
      id: `${Date.now()}_${i}_${f.name}`,
      file: f,
      name: f.name.replace(/\.gpx$/i, ''),
      mountainId: defaultMtn,
      status: 'wait',
      msg: '',
    }));
    // 최근에 추가한 파일이 위로 오도록 앞에 붙이고, 1페이지로 이동
    setRows((prev) => [...arr, ...prev]);
    setPage(1);
  }

  const applyMtnToAll = () => setRows((prev) => prev.map((r) => (r.status === 'done' ? r : { ...r, mountainId: defaultMtn })));

  // POST /api/track/bulk — tracks(JSON 배열) + files(같은 순서). 하나라도 실패하면 전부 롤백.
  async function uploadAll() {
    const pending = rows.filter((r) => r.status !== 'done');
    if (pending.length === 0) return;
    const bad = pending.find((r) => !r.mountainId || !r.name.trim());
    if (bad) { setRow(bad.id, { status: 'fail', msg: '산/경로명 누락' }); return; }

    setRunning(true);
    pending.forEach((r) => setRow(r.id, { status: 'up', msg: '' }));
    try {
      const fd = new FormData();
      // tracks[i] ↔ files[i] 순서 일치가 중요 (둘 다 pending 순서로)
      const tracks = pending.map((r) => ({ mountainId: Number(r.mountainId), name: r.name }));
      fd.append('tracks', new Blob([JSON.stringify(tracks)], { type: 'application/json' }));
      pending.forEach((r) => fd.append('files', r.file));

      const res = await apiFetch('/api/track/bulk', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? e.message ?? '일괄 등록 실패'); }
      pending.forEach((r) => setRow(r.id, { status: 'done', msg: '' }));
    } catch (e) {
      // 트랜잭션이라 전부 롤백 → 모두 실패로 표시
      pending.forEach((r) => setRow(r.id, { status: 'fail', msg: e.message }));
    } finally {
      setRunning(false);
    }
  }

  const total = rows.length;
  const done = rows.filter((r) => r.status === 'done').length;
  const fail = rows.filter((r) => r.status === 'fail').length;

  // ── 페이지네이션 ──────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const curPage    = Math.min(page, totalPages); // 행 제거로 범위를 벗어나면 보정
  const pageRows   = rows.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  function getPageNums() {
    const nums = [];
    const start = Math.max(1, curPage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }

  return (
    <AdminLayout active="routes" title="경로 일괄 등록" sub="BULK ROUTE UPLOAD">
      <div className="crumb" style={{ paddingTop: 0, marginBottom: 18 }}>
        <Link to="/admin/routes">경로 관리</Link><span className="sep">/</span><span className="here">일괄 등록</span>
      </div>

      <div className="data-card">
        <div className="dc-head">
          <h2>GPX 일괄 업로드</h2>
          <div className="tools" style={{ gap: 8 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              완료 {done} / 전체 {total}{fail ? ` · 실패 ${fail}` : ''}
            </span>
            <button className="btn pop sm" onClick={uploadAll} disabled={running || total === 0}>
              {running ? '등록 중…' : '전체 등록'}
            </button>
          </div>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 기본 소속 산 + 파일 선택 */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="md-label" style={{ margin: 0 }}>기본 소속 산</span>
            <select className="inp" style={{ width: 200 }} value={defaultMtn} onChange={(e) => setDefaultMtn(e.target.value)}>
              {mountains.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button className="btn sm" type="button" onClick={applyMtnToAll} disabled={total === 0}>전체 행에 적용</button>
          </div>

          <label className="dropzone" style={{ display: 'block' }}>
            <div className="dz-ic">🗺</div>
            <div className="dz-t">GPX 파일을 선택하세요 (여러 개 가능)</div>
            <div className="dz-s">.gpx · 파일 1개 = 코스 1개로 등록됩니다</div>
            <input type="file" accept=".gpx,application/gpx+xml,application/octet-stream" multiple hidden
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          </label>

          {/* 행 목록 */}
          {total === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: 12 }}>아직 추가된 파일이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pageRows.map((r) => (
                <div key={r.id} className="bulk-row">
                  <span className={'st-badge ' + ST[r.status]}>{ST_LABEL[r.status]}</span>
                  <span className="bulk-file" title={r.file.name}>📄 {r.file.name}</span>
                  <input className="inp" style={{ flex: 1, minWidth: 120 }} value={r.name}
                    placeholder="경로명" onChange={(e) => setRow(r.id, { name: e.target.value })} />
                  <select className="inp" style={{ width: 160 }} value={r.mountainId}
                    onChange={(e) => setRow(r.id, { mountainId: e.target.value })}>
                    {mountains.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  {r.status === 'fail' && <span className="mono" style={{ fontSize: 11, color: 'var(--pop-deep)' }}>{r.msg}</span>}
                  <button className="icon-btn danger" title="제거" onClick={() => removeRow(r.id)} disabled={running}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 — 2페이지 이상일 때만 */}
          {totalPages > 1 && (
            <div className="pagination" style={{ margin: '4px 0 0' }}>
              <span className={'pg ghost' + (curPage === 1 ? ' disabled' : '')}
                onClick={() => curPage > 1 && setPage(curPage - 1)}>←</span>
              {getPageNums().map((n) => (
                <span key={n} className={'pg' + (n === curPage ? ' on' : '')} onClick={() => setPage(n)}>{n}</span>
              ))}
              <span className={'pg ghost' + (curPage === totalPages ? ' disabled' : '')}
                onClick={() => curPage < totalPages && setPage(curPage + 1)}>→</span>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
