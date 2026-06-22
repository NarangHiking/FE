import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdminLayout from '../components/AdminLayout.jsx';
import { apiFetch } from '../context/AuthContext.jsx';

// 산 일괄 등록: 엑셀(.xlsx/.csv)을 FE에서 파싱 → 행마다 POST /api/mtn (이미지 없이).
// BE 일괄 엔드포인트가 없어 행 단위로 순차 등록하며 행별 성공/실패를 표시한다.
const ST       = { wait: 'wait', up: 'review', done: 'done', fail: 'reject' };
const ST_LABEL = { wait: '대기', up: '등록중', done: '완료', fail: '실패' };

// 엑셀 헤더(한글/영문) → Mtn 필드 매핑
const HEADER_MAP = {
  '이름': 'name', '산이름': 'name', '산 이름': 'name', 'name': 'name',
  '지역': 'location', 'location': 'location',
  '고도': 'height', '높이': 'height', '최고고도': 'height', '최고 고도': 'height', 'height': 'height',
  '설명': 'description', '소개': 'description', 'description': 'description',
  '위도': 'lat', 'lat': 'lat', 'latitude': 'lat',
  '경도': 'lng', 'lng': 'lng', 'lon': 'lng', 'longitude': 'lng',
  '사진출처': 'imageSource', '사진 출처': 'imageSource', '출처': 'imageSource',
  'imagesource': 'imageSource', 'image_source': 'imageSource',
};

const EMPTY = { name: '', location: '', height: '', description: '', lat: '', lng: '', imageSource: '' };

function parseWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return json.map((obj, i) => {
    const row = { id: `${Date.now()}_${i}`, ...EMPTY, status: 'wait', msg: '' };
    for (const [k, v] of Object.entries(obj)) {
      const raw = String(k).trim();
      const key = HEADER_MAP[raw] ?? HEADER_MAP[raw.toLowerCase()];
      if (key) row[key] = typeof v === 'string' ? v.trim() : v;
    }
    return row;
  });
}

// 행 유효성: name/location/height/description 필수 (DB NOT NULL), lat/lng 숫자
function validate(r) {
  if (!String(r.name).trim())     return '산이름 누락';
  if (!String(r.location).trim()) return '지역 누락';
  if (r.height === '' || isNaN(Number(r.height))) return '고도 숫자 아님';
  if (!String(r.description).trim()) return '설명 누락';
  if (r.lat !== '' && isNaN(Number(r.lat))) return '위도 숫자 아님';
  if (r.lng !== '' && isNaN(Number(r.lng))) return '경도 숫자 아님';
  return null;
}

export default function AdminMountainBulkPage() {
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);

  const setRow = (id, patch) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id) => setRows((prev) => prev.filter((r) => r.id !== id));

  function onFile(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseWorkbook(ev.target.result);
        if (parsed.length === 0) { alert('데이터 행이 없습니다. 첫 행을 헤더로 두고 그 아래에 데이터를 넣어주세요.'); return; }
        setRows(parsed);
      } catch {
        alert('엑셀을 읽지 못했습니다. 양식을 확인해주세요.');
      }
    };
    reader.readAsArrayBuffer(f);
  }

  // POST /api/mtn — mtn(JSON) 한 건 (이미지 없음)
  async function registerOne(r) {
    const mtn = {
      name: r.name, location: r.location,
      height: Number(r.height), description: r.description,
      lat: r.lat === '' ? null : Number(r.lat),
      lng: r.lng === '' ? null : Number(r.lng),
      imageSource: String(r.imageSource).trim() || null,
    };
    const fd = new FormData();
    fd.append('mtn', new Blob([JSON.stringify(mtn)], { type: 'application/json' }));
    const res = await apiFetch('/api/mtn', { method: 'POST', body: fd });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e.error ?? e.message ?? '등록 실패');
    }
  }

  async function uploadAll() {
    const pending = rows.filter((r) => r.status !== 'done');
    if (pending.length === 0) return;
    setRunning(true);
    for (const r of pending) {
      const err = validate(r);
      if (err) { setRow(r.id, { status: 'fail', msg: err }); continue; }
      setRow(r.id, { status: 'up', msg: '' });
      try { await registerOne(r); setRow(r.id, { status: 'done', msg: '' }); }
      catch (e) { setRow(r.id, { status: 'fail', msg: e.message }); }
    }
    setRunning(false);
  }

  // 양식(.xlsx) 다운로드
  function downloadTemplate() {
    const sample = [{ 산이름: '북한산', 지역: '서울 강북', 고도: 836, 설명: '서울 근교 대표 명산', 위도: 37.6586, 경도: 126.9779, 사진출처: '산림청' }];
    const ws = XLSX.utils.json_to_sheet(sample, { header: ['산이름', '지역', '고도', '설명', '위도', '경도', '사진출처'] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '산목록');
    XLSX.writeFile(wb, '산_일괄등록_양식.xlsx');
  }

  const total = rows.length;
  const done  = rows.filter((r) => r.status === 'done').length;
  const fail  = rows.filter((r) => r.status === 'fail').length;

  return (
    <AdminLayout active="mountains" title="산 일괄 등록" sub="BULK MOUNTAIN UPLOAD">
      <div className="crumb" style={{ paddingTop: 0, marginBottom: 18 }}>
        <Link to="/admin/mountains">산 관리</Link><span className="sep">/</span><span className="here">엑셀 일괄 등록</span>
      </div>

      <div className="data-card">
        <div className="dc-head">
          <h2>엑셀 일괄 업로드</h2>
          <div className="tools" style={{ gap: 8 }}>
            <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              완료 {done} / 전체 {total}{fail ? ` · 실패 ${fail}` : ''}
            </span>
            <button className="btn sm" type="button" onClick={downloadTemplate}>⬇ 양식 다운로드</button>
            <button className="btn pop sm" onClick={uploadAll} disabled={running || total === 0}>
              {running ? '등록 중…' : '전체 등록'}
            </button>
          </div>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label className="dropzone" style={{ display: 'block', cursor: 'pointer' }}>
            <div className="dz-ic">📊</div>
            <div className="dz-t">엑셀 파일을 선택하세요 (.xlsx · .csv)</div>
            <div className="dz-s">필수: 산이름 · 지역 · 고도 · 설명 / 선택: 위도 · 경도 · 사진출처 · (이미지는 등록 후 개별 수정)</div>
            <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={onFile} />
          </label>

          {total === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--ink-soft)', padding: 12 }}>
              아직 불러온 데이터가 없습니다. 양식을 받아 작성한 뒤 업로드하세요.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rows.map((r) => (
                <div key={r.id} className="bulk-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  <span className={'st-badge ' + ST[r.status]}>{ST_LABEL[r.status]}</span>
                  <input className="inp" style={{ width: 120 }} value={r.name} placeholder="산이름"
                    onChange={(e) => setRow(r.id, { name: e.target.value })} />
                  <input className="inp" style={{ width: 120 }} value={r.location} placeholder="지역"
                    onChange={(e) => setRow(r.id, { location: e.target.value })} />
                  <input className="inp" style={{ width: 80 }} value={r.height} placeholder="고도" type="number"
                    onChange={(e) => setRow(r.id, { height: e.target.value })} />
                  <input className="inp" style={{ flex: 1, minWidth: 160 }} value={r.description} placeholder="설명"
                    onChange={(e) => setRow(r.id, { description: e.target.value })} />
                  <input className="inp" style={{ width: 90 }} value={r.lat} placeholder="위도" type="number" step="any"
                    onChange={(e) => setRow(r.id, { lat: e.target.value })} />
                  <input className="inp" style={{ width: 90 }} value={r.lng} placeholder="경도" type="number" step="any"
                    onChange={(e) => setRow(r.id, { lng: e.target.value })} />
                  <input className="inp" style={{ width: 110 }} value={r.imageSource} placeholder="사진출처"
                    onChange={(e) => setRow(r.id, { imageSource: e.target.value })} />
                  {r.status === 'fail' && <span className="mono" style={{ fontSize: 11, color: 'var(--pop-deep)' }}>{r.msg}</span>}
                  <button className="icon-btn danger" title="제거" onClick={() => removeRow(r.id)} disabled={running}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
