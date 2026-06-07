import { Link, useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout.jsx';
import MountainScene from '../components/MountainScene.jsx';
import { Field, TextInput, Textarea, Select, UnitInput, Segmented, Dropzone } from '../components/Form.jsx';
import { findUser, findMountain, findRoute, MOUNTAIN_NAMES } from '../data/admin.js';
import { REGIONS } from '../data/mountains.js';

const REGION_NAMES = REGIONS.map((r) => r.name);

// entity 메타: 탭 key, 라벨, 목록 경로
const META = {
  users: { active: 'users', label: '유저', list: '/admin/users' },
  mountains: { active: 'mountains', label: '산', list: '/admin/mountains' },
  routes: { active: 'routes', label: '경로', list: '/admin/routes' },
};

export default function AdminFormPage() {
  const { tab, id } = useParams();
  const navigate = useNavigate();
  const entity = META[tab] ? tab : 'users';
  const m = META[entity];
  const isEdit = Boolean(id);

  const title = `${m.label} ${isEdit ? '수정' : '등록'}`;
  const sub = `${isEdit ? 'EDIT' : 'CREATE'} ${entity.toUpperCase()}${isEdit ? ' · ' + id : ''}`;

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO(BE): 등록/수정 저장 (entity·isEdit 분기). 폼 값 수집 후 호출:
    //   · 유저  : 등록 POST /api/user {email,pass,name} / 수정 PATCH /api/user {userId,pass,name}
    //   · 산(mtn): 등록 POST /api/mtn / 수정 PUT /api/mtn/{id}  (Mtn + 이미지 multipart)
    //   · 경로(track): 등록 POST /api/track / 수정 PUT /api/track  (Track JSON + gpxFilePath, GPX 업로드)
    //   성공 시 목록(m.list)으로 이동, 실패 시 에러 표시.
    navigate(m.list); // 디자인 전용: 저장 없이 목록으로
  };

  return (
    <AdminLayout active={m.active} title={title} sub={sub}>
      <div className="crumb" style={{ paddingTop: 0, marginBottom: 18 }}>
        <Link to={m.list}>{m.label} 관리</Link>
        <span className="sep">/</span>
        <span className="here">{isEdit ? `${id} 수정` : `새 ${m.label} 등록`}</span>
      </div>

      <form className="form-layout solo" onSubmit={onSubmit}>
        {entity === 'users' && <UserForm id={id} isEdit={isEdit} />}
        {entity === 'mountains' && <MountainForm id={id} isEdit={isEdit} />}
        {entity === 'routes' && <RouteForm id={id} isEdit={isEdit} />}
      </form>
    </AdminLayout>
  );
}

function FormShell({ title, isEdit, list, meta, children, deletable }) {
  return (
    <div className="form-card">
      <div className="fc-head">
        <h2>{title}</h2>
        <span className="mono">{isEdit ? 'EDIT MODE' : 'NEW'}</span>
      </div>
      <div className="fc-body">
        {isEdit && meta && (
          <div className="edit-meta">
            {meta.map((x) => (
              <div className="em" key={x.k}><div className="k">{x.k}</div><div className="v">{x.v}</div></div>
            ))}
          </div>
        )}
        <div className="form-grid">{children}</div>
      </div>
      <div className="form-actions">
        {isEdit && deletable && <span className="del-note">⚠ 삭제는 되돌릴 수 없습니다</span>}
        <span className="grow" />
        <Link className="btn ghost" to={list}>취소</Link>
        {isEdit && deletable && <button type="button" className="btn">삭제</button>}
        <button type="submit" className="btn pop">{isEdit ? '변경 저장' : '등록하기'}</button>
      </div>
    </div>
  );
}

/* ───────── 유저 ───────── */
function UserForm({ id, isEdit }) {
  const u = isEdit ? findUser(id) : null;
  return (
    <FormShell
      title="유저 정보" isEdit={isEdit} list="/admin/users" deletable
      meta={u && [{ k: 'ID', v: u.id }, { k: '작성글', v: u.posts }, { k: '가입일', v: u.joined }]}
    >
      <Field label="이름 / 닉네임" required>
        <TextInput value={u?.name} placeholder="닉네임" />
      </Field>
      <Field label="이메일" required>
        <TextInput type="email" value={u?.email} placeholder="user@example.com" />
      </Field>
      <Field label="권한" required>
        <Select value={u?.roleLabel ?? '일반'} options={['일반', '관리자', '정지']} />
      </Field>
      <Field label={isEdit ? '비밀번호 (변경 시에만)' : '초기 비밀번호'} required={!isEdit} hint="8자 이상, 영문+숫자">
        <TextInput type="password" placeholder="••••••••" />
      </Field>
      <Field label="가입일">
        <TextInput type="date" value={u?.joined ?? '2026-06-07'} />
      </Field>
      <Field label="상태 메모" full hint="관리자만 보이는 메모 (선택)">
        <Textarea placeholder="예: 광고성 댓글로 1회 경고 (2026-06-01)" style={{ minHeight: 90 }} />
      </Field>
    </FormShell>
  );
}

/* ───────── 산 ───────── */
const PALETTES = ['forest', 'moss', 'alpine', 'dawn', 'dusk', 'mist'];
function MountainForm({ id, isEdit }) {
  const m = isEdit ? findMountain(id) : null;
  return (
    <FormShell
      title="산 정보" isEdit={isEdit} list="/admin/mountains" deletable
      meta={m && [{ k: 'ID', v: m.id }, { k: '경로 수', v: m.routes }, { k: '수정일', v: m.updated }]}
    >
      <Field label="산 이름" required>
        <TextInput value={m?.name} placeholder="예: 북한산" />
      </Field>
      <Field label="한자 / 영문">
        <TextInput placeholder="예: 北漢山" />
      </Field>
      <Field label="지역" required>
        <Select value={REGION_NAMES[0]} options={REGION_NAMES} />
      </Field>
      <Field label="상세 지역">
        <TextInput value={m?.region} placeholder="예: 서울 강북" />
      </Field>
      <Field label="최고 고도" required>
        <UnitInput value={m?.ele} unit="m" type="number" placeholder="836" />
      </Field>
      <Field label="대표 난이도" required>
        <Segmented options={['초급', '중급', '상급']} />
      </Field>
      <Field label="공개 상태" required>
        <Segmented options={['공개', '검수중', '비공개']} value={m?.status ?? '검수중'} green />
      </Field>
      <Field label="대표 풍경 팔레트" hint="목록/상세의 산 이미지 색감">
        <Select value={PALETTES[0]} options={PALETTES} />
      </Field>
      <Field label="대표 이미지 미리보기" full>
        <div className="scene-preview">
          <MountainScene variant={isEdit ? Number(String(id).replace(/\D/g, '')) || 7 : 7} palette="forest" w={820} h={150} />
        </div>
      </Field>
      <Field label="소개" full hint="상세페이지 설명문">
        <Textarea placeholder="능선 조망이 뛰어난 대표 명산..." style={{ minHeight: 120 }} />
      </Field>
    </FormShell>
  );
}

/* ───────── 경로 ───────── */
function RouteForm({ id, isEdit }) {
  const r = isEdit ? findRoute(id) : null;
  return (
    <FormShell
      title="경로 정보" isEdit={isEdit} list="/admin/routes" deletable
      meta={r && [{ k: 'ID', v: r.id }, { k: '소속 산', v: r.mountain }, { k: '상태', v: r.status }]}
    >
      <Field label="소속 산" required>
        <Select value={r?.mountain ?? MOUNTAIN_NAMES[0]} options={MOUNTAIN_NAMES} />
      </Field>
      <Field label="경로명" required>
        <TextInput value={r?.name} placeholder="예: 백운대 정규 코스" />
      </Field>
      <Field label="코스 유형" required>
        <Segmented options={['원점회귀', '편도', '종주']} />
      </Field>
      <Field label="난이도" required>
        <Segmented options={['초급', '중급', '상급']} value={r?.lv} />
      </Field>
      <Field label="거리" required>
        <UnitInput value={r ? parseFloat(r.dist) : ''} unit="km" type="number" placeholder="5.2" />
      </Field>
      <Field label="예상 소요">
        <UnitInput unit="시간" type="number" placeholder="3" />
      </Field>
      <Field label="최고 고도">
        <UnitInput unit="m" type="number" placeholder="836" />
      </Field>
      <Field label="누적 상승">
        <UnitInput unit="m" type="number" placeholder="1100" />
      </Field>
      <Field label="공개 상태" required>
        <Segmented options={['공개', '검수중', '비공개']} value={r?.status ?? '검수중'} green />
      </Field>
      <Field label="GPX 파일" full hint=".gpx · 트랙 포인트가 지도/고도 그래프로 변환됩니다">
        <Dropzone icon="🗺" title={r?.gpx === '있음' ? '등록된 GPX 교체하기' : 'GPX 파일 업로드'} sub=".gpx 형식만 지원" />
      </Field>
      <Field label="경유지 메모" full hint="줄바꿈으로 구분 (예: 탐방지원센터, 약수터, 정상...)">
        <Textarea placeholder={'탐방지원센터 (출발)\n약수터\n백운대 정상\n전망 바위\n탐방지원센터 (도착)'} style={{ minHeight: 120 }} />
      </Field>
    </FormShell>
  );
}
