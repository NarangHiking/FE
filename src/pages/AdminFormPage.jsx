import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import { Field, TextInput, Textarea, Select } from '../components/Form.jsx';
import { apiFetch } from '../context/AuthContext.jsx';

const META = {
  users:     { active: 'users',     label: '유저', list: '/admin/users' },
  mountains: { active: 'mountains', label: '산',   list: '/admin/mountains' },
  routes:    { active: 'routes',    label: '경로', list: '/admin/routes' },
};

export default function AdminFormPage() {
  const { tab, id } = useParams();
  const entity = META[tab] ? tab : 'users';
  const m      = META[entity];
  const isEdit = Boolean(id);

  const title = `${m.label} ${isEdit ? '수정' : '등록'}`;
  const sub   = `${isEdit ? 'EDIT' : 'CREATE'} ${entity.toUpperCase()}${isEdit ? ' · ' + id : ''}`;

  return (
    <AdminLayout active={m.active} title={title} sub={sub}>
      <div className="crumb" style={{ paddingTop: 0, marginBottom: 18 }}>
        <Link to={m.list}>{m.label} 관리</Link>
        <span className="sep">/</span>
        <span className="here">{isEdit ? `${id} 수정` : `새 ${m.label} 등록`}</span>
      </div>

      <div className="form-layout solo">
        {entity === 'users'     && <UserForm     id={id} isEdit={isEdit} list={m.list} />}
        {entity === 'mountains' && <MountainForm id={id} isEdit={isEdit} list={m.list} />}
        {entity === 'routes'    && <RouteForm    id={id} isEdit={isEdit} list={m.list} />}
      </div>
    </AdminLayout>
  );
}

// ── 공통 폼 껍데기 ────────────────────────────────────────────
function FormShell({ title, isEdit, list, children, onSubmit, submitting, error }) {
  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="fc-head">
        <h2>{title}</h2>
        <span className="mono">{isEdit ? 'EDIT MODE' : 'NEW'}</span>
      </div>
      <div className="fc-body">
        <div className="form-grid">{children}</div>
      </div>
      {error && <p style={{ color: 'var(--pop)', padding: '0 24px 12px' }}>{error}</p>}
      <div className="form-actions">
        <span className="grow" />
        <Link className="btn ghost" to={list}>취소</Link>
        <button type="submit" className="btn pop" disabled={submitting}>
          {submitting ? '저장 중…' : isEdit ? '변경 저장' : '등록하기'}
        </button>
      </div>
    </form>
  );
}

// ── 유저 폼 ──────────────────────────────────────────────────
// 등록: POST /api/user { email, pass, name }
// 수정: BE에 admin-edit-user 엔드포인트 없음 → 비밀번호/이름만 PATCH /api/user (본인 수정과 동일)
function UserForm({ id, isEdit, list }) {
  const navigate = useNavigate();
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // edit 모드: GET /api/user/list에서 해당 유저 찾아 prefill
  useEffect(() => {
    if (!isEdit) return;
    apiFetch('/api/user/list')
      .then(r => r.json())
      .then(j => {
        const users = j.data ?? j;
        const u = users.find(u => String(u.id) === String(id));
        if (u) { setName(u.name ?? ''); setEmail(u.email ?? ''); }
      })
      .catch(() => {});
  }, [id, isEdit]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      let res;
      if (isEdit) {
        // 관리자가 다른 유저 수정하는 전용 API 없음 → 이름만 수정 가능
        res = await apiFetch('/api/user', {
          method: 'PATCH',
          body: JSON.stringify({ name, ...(pass ? { pass } : {}) }),
        });
      } else {
        res = await apiFetch('/api/user', {
          method: 'POST',
          body: JSON.stringify({ email, pass, name }),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? '저장 실패');
      }
      navigate(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormShell title="유저 정보" isEdit={isEdit} list={list} onSubmit={onSubmit} submitting={submitting} error={error}>
      <Field label="이름 / 닉네임" required>
        <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="닉네임" />
      </Field>
      <Field label="이메일" required={!isEdit}>
        <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="user@example.com" disabled={isEdit} />
      </Field>
      <Field label={isEdit ? '비밀번호 (변경 시에만)' : '비밀번호'} required={!isEdit} hint="8자 이상, 영문+숫자">
        <TextInput type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
      </Field>
    </FormShell>
  );
}

// ── 산 폼 ────────────────────────────────────────────────────
// 등록: POST /api/mtn  { name, location, height }
// 수정: PUT  /api/mtn/{id}
function MountainForm({ id, isEdit, list }) {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [location, setLocation] = useState('');
  const [height,   setHeight]   = useState('');
  const [description, setDescription] = useState(''); // TEXT NOT NULL
  const [file,     setFile]     = useState(null); // 대표 이미지
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // edit 모드: GET /api/mtn/{id}
  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/api/mtn/${id}`)
      .then(r => r.json())
      .then(j => {
        const m = j.data ?? j;
        setName(m.name ?? '');
        setLocation(m.location ?? '');
        setHeight(m.height ?? '');
        setDescription(m.description ?? '');
      })
      .catch(() => {});
  }, [id, isEdit]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // 산 등록/수정은 multipart: @RequestPart Mtn mtn + @RequestPart(file) (이미지)
      const mtn = isEdit
        ? { id: Number(id), name, location, height: Number(height), description }
        : { name, location, height: Number(height), description };
      // ⚠ BE insert 가 file.getOriginalFilename() 을 null 체크 없이 호출 → 등록 시 이미지 필수
      if (!isEdit && !file) {
        setError('대표 이미지를 선택해주세요.');
        setSubmitting(false);
        return;
      }
      const fd = new FormData();
      fd.append('mtn', new Blob([JSON.stringify(mtn)], { type: 'application/json' }));
      if (file) fd.append('file', file);
      const res = isEdit
        ? await apiFetch(`/api/mtn/${id}`, { method: 'PUT',  body: fd })
        : await apiFetch('/api/mtn',        { method: 'POST', body: fd });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? err.message ?? '저장 실패');
      }
      navigate(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormShell title="산 정보" isEdit={isEdit} list={list} onSubmit={onSubmit} submitting={submitting} error={error}>
      <Field label="산 이름" required>
        <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="예: 북한산" maxLength={50} />
      </Field>
      <Field label="지역" required hint="예: 서울 강북, 전남 구례">
        <TextInput value={location} onChange={e => setLocation(e.target.value)} placeholder="예: 서울 강북" maxLength={50} />
      </Field>
      <Field label="최고 고도 (m)" required>
        <TextInput type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="836" />
      </Field>
      <Field label="설명" required hint="산 소개 (상세페이지에 표시)">
        <textarea className="inp" style={{ minHeight: 96 }} value={description}
          onChange={e => setDescription(e.target.value)} placeholder="예: 서울 도심에서 가장 가까운 국립공원으로…" />
      </Field>
      <Field label="대표 이미지" required={!isEdit} hint={isEdit ? '변경할 때만 선택' : 'JPG / PNG · 등록 시 필수'}>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      </Field>
    </FormShell>
  );
}

// ── 경로 폼 ──────────────────────────────────────────────────
// 등록/수정 모두 multipart: @RequestPart Track t (JSON) + @RequestPart file (GPX, 선택)
function RouteForm({ id, isEdit, list }) {
  const navigate = useNavigate();
  const [mountains,   setMountains]   = useState([]);
  const [mountainId,  setMountainId]  = useState('');
  const [name,        setName]        = useState('');
  const [file,        setFile]        = useState(null);  // 업로드할 GPX 파일
  const [currentGpx,  setCurrentGpx]  = useState('');    // 기존 GPX 경로(수정 시 표시)
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 산 목록 조회 (소속 산 선택용)
  useEffect(() => {
    apiFetch('/api/mtn/list')
      .then(r => r.json())
      .then(j => {
        const list = j.data ?? j;
        setMountains(list);
        if (!isEdit && list.length > 0) setMountainId(String(list[0].id));
      })
      .catch(() => {});
  }, [isEdit]);

  // edit 모드: GET /api/track/{id}
  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/api/track/${id}`)
      .then(r => r.json())
      .then(j => {
        const t = j.data ?? j;
        setMountainId(String(t.mountainId ?? ''));
        setName(t.name ?? '');
        setCurrentGpx(t.gpxFilePath ?? '');
      })
      .catch(() => {});
  }, [id, isEdit]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // multipart: @RequestPart Track t (JSON) + @RequestPart file (GPX, 선택)
      const t = isEdit
        ? { id: Number(id), mountainId: Number(mountainId), name }
        : { mountainId: Number(mountainId), name };
      const fd = new FormData();
      fd.append('t', new Blob([JSON.stringify(t)], { type: 'application/json' }));
      if (file) fd.append('file', file);
      const res = isEdit
        ? await apiFetch('/api/track', { method: 'PUT',  body: fd })
        : await apiFetch('/api/track', { method: 'POST', body: fd });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? err.message ?? '저장 실패');
      }
      navigate(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const mtnOptions = mountains.map(m => m.name);
  const selectedMtn = mountains.find(m => String(m.id) === mountainId)?.name ?? '';

  return (
    <FormShell title="경로 정보" isEdit={isEdit} list={list} onSubmit={onSubmit} submitting={submitting} error={error}>
      <Field label="소속 산" required>
        <Select
          value={selectedMtn}
          options={mtnOptions}
          onChange={e => {
            const m = mountains.find(m => m.name === e.target.value);
            if (m) setMountainId(String(m.id));
          }}
        />
      </Field>
      <Field label="경로명" required>
        <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="예: 백운대 정규 코스" />
      </Field>
      <Field label="GPX 파일" hint={isEdit ? (currentGpx ? `현재: ${currentGpx} · 변경 시에만 선택` : '변경 시에만 선택') : '.gpx 파일 업로드 (선택)'}>
        <input type="file" accept=".gpx,application/gpx+xml,application/octet-stream"
          onChange={e => setFile(e.target.files?.[0] ?? null)} />
      </Field>
    </FormShell>
  );
}
