import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Field, TextInput, Textarea, Select } from '../components/Form.jsx';
import { BASE, apiFetch } from '../context/AuthContext.jsx';

const CONFIG = {
  board: {
    eyebrow: 'WRITE · 자유게시판',
    editEyebrow: 'EDIT · 자유게시판',
    title: '글쓰기',
    editTitle: '글 수정',
    back: '/board',
    backLabel: '자유게시판',
    category: 'free',
    cats: ['후기', '질문', '자유', '정보'],
    placeholder: '제목을 입력하세요 (예: 북한산 백운대 다녀온 후기)',
    bodyPlaceholder: '본문을 작성하세요.',
    tips: [
      '후기는 코스명·날짜·난이도를 함께 적어주면 좋아요.',
      '욕설/광고/도배 글은 통보 없이 삭제될 수 있어요.',
      '사진은 최대 10장까지 첨부할 수 있어요.',
    ],
  },
  suggestions: {
    eyebrow: 'WRITE · 건의게시판',
    editEyebrow: 'EDIT · 건의게시판',
    title: '건의하기',
    editTitle: '건의 수정',
    back: '/suggestions',
    backLabel: '건의게시판',
    category: 'feedback',
    cats: ['산 추가', '경로 수정', '기능 제안', '오류 신고'],
    placeholder: '건의 제목을 입력하세요 (예: 가평 운악산 코스 등록 요청)',
    bodyPlaceholder: '어떤 산/경로가 빠졌는지, 무엇을 개선하면 좋을지 구체적으로 적어주세요.',
    tips: [
      '산 추가 요청 시 지역과 들머리(출발지)를 적어주세요.',
      '오류 신고는 어떤 페이지인지 함께 알려주세요.',
      '관리자 검토 후 상태가 업데이트됩니다.',
    ],
  },
};

export default function PostWritePage() {
  const { pathname } = useLocation();
  const { id }       = useParams();         // /board/:id/edit 이면 존재, 아니면 undefined
  const navigate     = useNavigate();
  const isEdit       = !!id;

  const kind = pathname.startsWith('/suggestions') ? 'suggestions' : 'board';
  const c    = CONFIG[kind];

  // ── 폼 상태 ────────────────────────────────────────────────
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [cat, setCat]         = useState(c.cats[0]);
  const [trackId, setTrackId] = useState('');      // 대상 코스 (건의는 필수)
  const [tracks, setTracks]   = useState([]);       // [{id, label}]
  const [trackQuery, setTrackQuery] = useState(''); // 코스 검색어
  const [files, setFiles]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef(null);

  // ── 코스 목록 (대상 코스 선택용): /api/track + /api/mtn/list → "산이름 · 코스명" ──
  useEffect(() => {
    Promise.all([
      apiFetch('/api/track').then((r) => (r.ok ? r.json() : null)),
      apiFetch('/api/mtn/list').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([tj, mj]) => {
        const tl = tj?.data ?? tj ?? [];
        const ml = mj?.data ?? mj ?? [];
        const mname = Object.fromEntries(ml.map((m) => [m.id, m.name]));
        setTracks(tl.map((t) => ({ id: t.id, label: `${mname[t.mountainId] ?? '산'} · ${t.name}` })));
      })
      .catch(() => {});
  }, []);

  // ── edit 모드: 기존 게시글 불러와서 prefill ───────────────
  // GET /api/board/{id} → title, content, category, trackId 채우기
  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/api/board/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('게시글을 불러오지 못했습니다.');
        return res.json();
      })
      .then((json) => {
        const post = json.data ?? json;
        setTitle(post.title   ?? '');
        setContent(post.content ?? '');
        setTrackId(post.trackId != null ? String(post.trackId) : '');
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  // ── 파일 처리 ─────────────────────────────────────────────
  function handleFiles(e) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected].slice(0, 10));
  }
  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── 제출 ─────────────────────────────────────────────────
  // 작성: POST /api/board
  // 수정: PUT  /api/board/{id}
  // 둘 다 multipart/form-data → fetch 직접 사용
  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim())   return setError('제목을 입력하세요.');
    if (!content.trim()) return setError('내용을 입력하세요.');
    // 건의(feedback)는 대상 코스(trackId) 필수 — BE도 400으로 막지만 미리 차단
    if (kind === 'suggestions' && !trackId) return setError('건의는 대상 등산 코스를 선택해야 합니다.');

    setError('');
    setSubmitting(true);

    try {
      // BE는 board 파트를 JSON Blob으로, 파일은 addedImages 로 기대
      const board = { title, content, category: c.category };
      if (trackId) board.trackId = Number(trackId); // 자유글은 선택, 건의는 필수
      const fd = new FormData();
      fd.append('board', new Blob([JSON.stringify(board)], { type: 'application/json' }));
      files.forEach((f) => fd.append('addedImages', f));

      const url    = isEdit ? `${BASE}/api/board/${id}` : `${BASE}/api/board`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, { method, credentials: 'include', body: fd });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? err.message ?? '저장에 실패했습니다.');
      }

      const json    = await res.json();
      const created = json.data ?? json;
      navigate(`/board/${isEdit ? id : created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const eyebrow   = isEdit ? c.editEyebrow : c.eyebrow;
  const pageTitle = isEdit ? c.editTitle   : c.title;

  // 코스 검색 픽커
  const selectedTrack = tracks.find((t) => String(t.id) === trackId);
  const trackMatches = trackQuery
    ? tracks.filter((t) => t.label.toLowerCase().includes(trackQuery.toLowerCase())).slice(0, 50)
    : [];

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span>
        <Link to={c.back}>{c.backLabel}</Link><span className="sep">/</span>
        {isEdit && <><Link to={`/board/${id}`}>게시글</Link><span className="sep">/</span></>}
        <span className="here">{pageTitle}</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{pageTitle}</h1>
      </div>

      <form className="form-layout" onSubmit={onSubmit}>
        <div className="form-card">
          <div className="fc-head">
            <h2>{pageTitle}</h2>
            <span className="mono">DRAFT · 자동 저장 안 됨</span>
          </div>

          <div className="fc-body">
            <div className="form-grid">
              <Field label="분류" required>
                <Select value={cat} options={c.cats} onChange={(e) => setCat(e.target.value)} />
              </Field>

              <Field
                label="대상 코스"
                required={kind === 'suggestions'}
                hint={kind === 'suggestions' ? '건의는 대상 코스를 검색해 선택하세요' : '관련 코스가 있으면 검색해 선택'}
                full
              >
                {selectedTrack ? (
                  <div className="course-chip">
                    🥾 {selectedTrack.label}
                    <button type="button" onClick={() => { setTrackId(''); setTrackQuery(''); }} title="선택 해제">✕</button>
                  </div>
                ) : (
                  <div className="course-pick">
                    <input
                      className="inp"
                      placeholder="산 이름 또는 코스명으로 검색 (예: 북한산, 백운대)"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                    />
                    {trackQuery && (
                      <ul className="course-results">
                        {trackMatches.length === 0 ? (
                          <li className="none">검색 결과가 없어요</li>
                        ) : (
                          trackMatches.map((t) => (
                            <li key={t.id} onClick={() => { setTrackId(String(t.id)); setTrackQuery(''); }}>
                              🥾 {t.label}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </Field>

              <Field label="제목" required full>
                <TextInput
                  placeholder={c.placeholder}
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>

              <Field label="내용" required full hint="최대 10,000자">
                <Textarea
                  tall
                  placeholder={c.bodyPlaceholder}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </Field>

              <Field label="사진 첨부" full hint="JPG / PNG / GIF · 장당 10MB 이하 · 최대 10장">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFiles}
                />
                <div className="dropzone" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer' }}>
                  <div className="dz-ic">🏞</div>
                  <div className="dz-t">사진을 끌어다 놓거나 클릭하여 업로드</div>
                  <div className="dz-s">최대 10장</div>
                </div>
                {files.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }}>
                        <span>{f.name}</span>
                        <button type="button" onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pop)' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          </div>

          {error && <p style={{ color: 'var(--pop)', padding: '0 24px 12px' }}>{error}</p>}

          <div className="form-actions">
            <Link className="btn ghost" to={isEdit ? `/board/${id}` : c.back}>취소</Link>
            <button type="submit" className="btn pop" disabled={submitting}>
              {submitting ? '저장 중…' : isEdit ? '수정 완료' : '등록하기'}
            </button>
          </div>
        </div>

        <aside className="tips-card">
          <h4>✍ 작성 팁</h4>
          <ul>
            {c.tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </aside>
      </form>
    </div>
  );
}
