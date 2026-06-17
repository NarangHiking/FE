import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import { MOUNTAINS } from '../data/mountains.js';
import { apiFetch, useAuth } from '../context/AuthContext.jsx';

const PALETTES = ['forest', 'moss', 'alpine', 'dusk', 'mist', 'dawn'];

// 기상청 단기예보 코드 → 아이콘/텍스트 (SKY 1맑음 3구름많음 4흐림 / PTY 0없음 1비 2비눈 3눈 4소나기)
function wxIcon(w) {
  if (!w) return '⛅';
  const pty = w.precipitationType;
  if (pty && pty !== '0') return pty === '3' ? '❄️' : pty === '2' ? '🌨' : '🌧';
  return w.sky === '1' ? '☀️' : w.sky === '4' ? '☁️' : '⛅';
}
function wxText(w) {
  if (!w) return '';
  const pty = w.precipitationType;
  if (pty && pty !== '0') return pty === '1' ? '비' : pty === '2' ? '비/눈' : pty === '3' ? '눈' : '소나기';
  return w.sky === '1' ? '맑음' : w.sky === '4' ? '흐림' : '구름 많음';
}
const fmtHour = (t) => (t ? `${String(t).slice(0, 2)}시` : '');
const fmtClock = (t) => { if (!t) return '—'; const s = String(t).trim().padStart(4, '0'); return `${s.slice(0, 2)}:${s.slice(2, 4)}`; };
const todayYmd = () => { const d = new Date(); return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`; };

// BE Track → 코스 탭 포맷 변환 (km·lv 는 BE Track 에 없어 더미)
function toRoute(track, fallbackSummit) {
  return {
    id: track.id,
    name: track.name,
    summit: fallbackSummit,
    gpxFilePath: track.gpxFilePath,
    recommendCnt: track.recommendCnt ?? 0,
  };
}

export default function MountainDetailPage() {
  const { id } = useParams();

  // ── 산 상세 & 코스 목록 상태 ──
  const [mtn, setMtn] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  const [tab, setTab] = useState(0);
  const [fav, setFav] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 화면(디자인) 상태
  const [aiOpen, setAiOpen] = useState(true);

  // 날씨(시간대별) + 일출/일몰
  const [weather, setWeather] = useState([]);
  const [wxIdx, setWxIdx] = useState(0);
  const [wxErr, setWxErr] = useState(false);
  const [sun, setSun] = useState(null);

  // 트랙(코스)별 댓글
  const [comments, setComments] = useState([]);
  const [cmtText, setCmtText] = useState('');
  const [cmtFiles, setCmtFiles] = useState([]);
  const [cmtBusy, setCmtBusy] = useState(false);
  const fileRef = useRef(null);

  // 이미지 응답 필드명이 확정 전이라 방어적으로 처리 (url / imageUrl / path / storedFilename)
  const imgSrc = (img) =>
    typeof img === 'string' ? img : (img?.url ?? img?.imageUrl ?? img?.path ?? img?.storedFilename ?? '');

  // ── 산 상세 + 코스 목록 병렬 조회 ──
  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/api/mtn/${id}`).then((r) => r.json()),
      apiFetch(`/api/mtn/${id}/track`).then((r) => r.json()),
    ])
      .then(([mtnJson, trackJson]) => {
        const mtnData = mtnJson.data ?? mtnJson;
        const trackData = trackJson.data ?? trackJson;
        setMtn(mtnData);
        setRoutes((trackData ?? []).map((t) => toRoute(t, mtnData.height ?? 0)));
        setTab(0);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── 날씨(시간대별) + 일출/일몰 조회 ──
  //   GET /api/weather?mtnName=&fcstDate=(오늘)  → [WeatherResponse...]
  //   GET /api/sun?locdate=&location=            → response.body.items.item {sunrise,sunset}
  useEffect(() => {
    if (!mtn?.name) return;
    const ymd = todayYmd();
    setWxErr(false);
    apiFetch(`/api/weather?mtnName=${encodeURIComponent(mtn.name)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => { setWeather(j.data ?? j); setWxIdx(0); })
      .catch(() => setWxErr(true));
    // KASI 일출일몰 location 은 지명(시/도)만 받음 → mtn.location 의 첫 지명 사용 (예: "서울/경기" → "서울")
    const sunLoc = (mtn.location || mtn.name).split('/')[0].trim().split(' ')[0];
    apiFetch(`/api/sun?locdate=${ymd}&location=${encodeURIComponent(sunLoc)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!j) return;
        const item = j?.data?.response?.body?.items?.item ?? j?.response?.body?.items?.item ?? null;
        if (item) setSun(item);
      })
      .catch(() => {});
  }, [mtn?.name]);

  // ── 코스 탭 바뀔 때 추천 여부 조회 ──
  useEffect(() => {
    const trackId = routes[tab]?.id;
    setLikeCount(routes[tab]?.recommendCnt ?? 0);
    if (!user || !trackId) {
      setLiked(false);
      setFav(false);
      return;
    }
    // 추천 여부 GET /api/recommend/{trackId}
    apiFetch(`/api/recommend/${trackId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => { if (json) setLiked(json.data ?? false); })
      .catch(() => {});
    // 저장(즐겨찾기) 여부 GET /api/favorite/{trackId}
    apiFetch(`/api/favorite/${trackId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => { if (json) setFav(json.data ?? false); })
      .catch(() => {});
  }, [tab, routes, user]);

  // ── ♥ 추천 토글: POST/DELETE /api/recommend/{trackId} ──
  async function toggleLike() {
    if (!user) return;
    const trackId = routes[tab]?.id;
    if (!trackId) return;
    const method = liked ? 'DELETE' : 'POST';
    const res = await apiFetch(`/api/recommend/${trackId}`, { method });
    if (res.ok) {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c - 1 : c + 1));
    }
  }

  // ── ☆ 저장(즐겨찾기) 토글: POST/DELETE /api/favorite/{trackId} ──
  async function toggleFav() {
    if (!user) { alert('로그인 후 코스를 저장할 수 있어요.'); return; }
    const trackId = routes[tab]?.id;
    if (!trackId) return;
    const method = fav ? 'DELETE' : 'POST';
    const res = await apiFetch(`/api/favorite/${trackId}`, { method });
    if (res.ok) setFav((v) => !v);
  }

  // ── 트랙별 댓글 로드: 코스 탭이 바뀌면 해당 trackId 댓글만 조회 ──
  // TODO(BE): 트랙 댓글 API 필요(게시판 댓글과 동일 형태).
  //   GET  /api/track/{trackId}/comment
  //   POST /api/track/{trackId}/comment            { content }
  //   DELETE /api/track/{trackId}/comment/{commentId}
  //   응답: { id, userId, name, content, createdAt }
  useEffect(() => {
    const trackId = routes[tab]?.id;
    if (!trackId) { setComments([]); return; }
    apiFetch(`/api/track/${trackId}/comment`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setComments(json ? (json.data ?? json) : []))
      .catch(() => setComments([]));
  }, [tab, routes]);

  // 댓글 작성 / 삭제
  // POST /api/track/{trackId}/comment — multipart: comment(JSON 파트) + images(파일)
  async function submitComment(e) {
    e.preventDefault();
    const trackId = routes[tab]?.id;
    if (!trackId || !cmtText.trim()) return;
    setCmtBusy(true);
    try {
      const fd = new FormData();
      // @RequestPart("comment") TrackCommentRequest → JSON Blob 으로 첨부 (userId/trackId 는 서버가 채움)
      fd.append('comment', new Blob([JSON.stringify({ content: cmtText })], { type: 'application/json' }));
      cmtFiles.forEach((f) => fd.append('images', f));
      const res = await apiFetch(`/api/track/${trackId}/comment`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const json = await apiFetch(`/api/track/${trackId}/comment`).then((r) => r.json());
      setComments(json.data ?? json);
      setCmtText('');
      setCmtFiles([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setCmtBusy(false);
    }
  }
  async function deleteComment(commentId) {
    const trackId = routes[tab]?.id;
    if (!trackId || !window.confirm('댓글을 삭제하시겠습니까?')) return;
    const res = await apiFetch(`/api/track/${trackId}/comment/${commentId}`, { method: 'DELETE' });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
    else alert('댓글 삭제에 실패했습니다.');
  }

  if (loading) return <div className="wrap" style={{ padding: 60, textAlign: 'center' }}>불러오는 중…</div>;
  if (error) return <div className="wrap" style={{ padding: 60, textAlign: 'center', color: 'var(--pop)' }}>{error}</div>;
  if (!mtn) return null;

  const pal = PALETTES[mtn.id % PALETTES.length];
  const route = routes[tab];

  // ── 지도 좌표 ──
  // TODO(BE): Mtn DTO 에 lat/lng 추가 권장. 현재는 더미 좌표표에서 이름으로 매칭, 없으면 북한산.
  const coord = MOUNTAINS.find((x) => x.name === mtn.name);
  const lat = mtn.lat ?? coord?.lat ?? 37.6586;
  const lng = mtn.lng ?? coord?.lng ?? 126.9779;
  const dLat = 0.05, dLng = 0.075;
  const bbox = `${lng - dLng}%2C${lat - dLat}%2C${lng + dLng}%2C${lat + dLat}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  // ── AI 어시스턴트 (디자인용 정적 대화) ──
  // TODO(AI): 실제 어시스턴트 연동(Claude API 등). BE 레포엔 없음 → 별도 AI 서비스 필요.
  const aiMsgs = [
    { role: 'bot', text: `${mtn.name}은(는) 서울 도심에서 가장 가까운 국립공원이에요. ${mtn.height}m가 최고봉이며, 주능선 코스가 가장 인기 있습니다. 왕복 약 4~5시간 소요됩니다.` },
    { role: 'user', text: '준비물 알려줘' },
    { role: 'bot', text: '필수 준비물로는 등산화, 등산스틱, 여벌 옷, 충분한 물(1인 1.5L 이상), 간식, 구급약, 지도 또는 GPS를 챙기시길 추천드려요!' },
  ];
  const aiChips = ['날씨 확인', '초보 코스 추천', '준비물 알려줘', `${mtn.name} 정보`];

  // 시간대별 날씨 (앞쪽 8개 슬롯) + 선택 슬롯
  const wxSlots = weather.slice(0, 8);
  const wxCur = wxSlots[wxIdx] ?? wxSlots[0] ?? null;

  return (
    <div className="md">
      {/* ───── 좌측: 정보 + 후기 ───── */}
      <aside className="md-left">
        <div className="md-hero">
          <MountainScene variant={(mtn.id ?? 1) + 30} palette={pal} w={384} h={196} />
          <div className="ht" />
          <div className="veil" />
          <span className="ele-badge">↑ {mtn.height}m</span>
          <div className="hbody">
            <div className="heyebrow">{mtn.location} · NARANG TRAIL</div>
            <h1>{mtn.name}</h1>
          </div>
        </div>

        <div className="md-sec">
          <p className="md-desc">
            {mtn.description ?? `${mtn.location}의 대표 명산. GPX 트랙으로 출발지·고도·갈림길을 미리 확인하고 안전하게 다녀오세요.`}
          </p>
        </div>

        <div className="md-sec">
          <div className="md-label">COURSE</div>
          {routes.length === 0 ? (
            <select className="inp" disabled><option>등록된 코스가 없습니다</option></select>
          ) : (
            <select className="inp" value={tab} onChange={(e) => setTab(Number(e.target.value))}>
              {routes.map((r, i) => (
                <option key={r.id ?? i} value={i}>코스 {i + 1} - {r.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="md-sec" style={{ borderBottom: 'none' }}>
          <div className="md-reviews-head">
            <div>
              <div className="t">TRAIL COMMENTS</div>
              <div className="n">댓글 {comments.length}개</div>
            </div>
            <span className="cmt">💬</span>
          </div>
          {/* 선택된 코스(트랙)별로 댓글이 나뉜다 */}
          {route && <div className="cmt-track-label">📍 {route.name}</div>}

          {/* 댓글 작성 (로그인 시) */}
          {user ? (
            <form className="md-cmt-form" onSubmit={submitComment}>
              <textarea
                placeholder={`이 코스 후기를 남겨주세요`}
                value={cmtText}
                onChange={(e) => setCmtText(e.target.value)}
                rows={2}
              />
              <div className="md-cmt-foot">
                <label className="cmt-file">
                  📷 사진{cmtFiles.length > 0 ? ` ${cmtFiles.length}` : ''}
                  <input ref={fileRef} type="file" accept="image/*" multiple hidden
                    onChange={(e) => setCmtFiles(Array.from(e.target.files))} />
                </label>
                <button className="btn pop sm" type="submit" disabled={cmtBusy || !route}>
                  {cmtBusy ? '등록 중…' : '댓글 등록'}
                </button>
              </div>
            </form>
          ) : (
            <p className="md-cmt-login">댓글을 남기려면 <Link to="/login">로그인</Link>이 필요합니다.</p>
          )}

          {comments.length === 0 ? (
            <p className="md-cmt-empty">아직 이 코스에 댓글이 없어요. 첫 후기를 남겨보세요!</p>
          ) : (
            comments.map((c) => (
              <div className="review-item" key={c.id}>
                <div className="rtop">
                  <div className="rav">{(c.name ?? '?').slice(0, 1)}</div>
                  <div className="rwho">{c.name}</div>
                  <div className="rdate">{c.createdAt}</div>
                  {user && user.name === c.name && (
                    <button className="cmt-del" onClick={() => deleteComment(c.id)}>삭제</button>
                  )}
                </div>
                <div className="rbody">{c.content}</div>
                {Array.isArray(c.images) && c.images.length > 0 && (
                  <div className="rphotos">
                    {c.images.map((img, k) => (
                      <a className="rphoto" key={k} href={imgSrc(img)} target="_blank" rel="noreferrer">
                        <img src={imgSrc(img)} alt="" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ───── 중앙: 지도 + 코스/날씨 카드 ───── */}
      <div className="md-map">
        <iframe
          className="md-iframe"
          title={`${mtn.name} 지도`}
          src={mapSrc}
          loading="lazy"
        />

        {/* 코스 + 날씨 플로팅 카드 */}
        <div className="md-course-card">
          <div className="cc-eyebrow">🥾 선택 코스</div>
          <div className="cc-top">
            <div className="cc-title">{route ? route.name : '등록된 코스 없음'}</div>
            <div className="cc-actions">
              <button className={'cc-save' + (fav ? ' on' : '')} onClick={toggleFav}
                title={user ? '' : '로그인 후 저장'}>
                {fav ? '★ 저장됨' : '☆ 저장'}
              </button>
              <button className="ic" title="공유">🔗</button>
            </div>
          </div>
          <div className="cc-meta">
            <span className="k">최고 고도</span>
            <span className="ele">{mtn.height}m</span>
            {/* ♥ 추천(좋아요): GET/POST/DELETE /api/recommend/{trackId} */}
            <button
              className="like"
              onClick={toggleLike}
              title={user ? '' : '로그인 후 추천할 수 있어요'}
              style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'not-allowed' }}
            >
              {liked ? '♥' : '♡'} {likeCount.toLocaleString()}
            </button>
          </div>

          <div className="cc-wx-label">🌤 시간대별 날씨</div>
          {wxSlots.length === 0 ? (
            <div className="wx-empty">{wxErr ? '날씨 정보를 불러올 수 없어요' : '날씨 정보를 불러오는 중…'}</div>
          ) : (
            <>
              <div className="wx-days">
                {wxSlots.map((w, i) => (
                  <div key={i} className={'wx-day' + (i === wxIdx ? ' on' : '')} onClick={() => setWxIdx(i)}>
                    <div className="wd">{fmtHour(w.fcstTime)}</div>
                    <div className="we">{wxIcon(w)}</div>
                    <div className="wt">{w.temperature}°</div>
                  </div>
                ))}
              </div>
              <div className="wx-summary">
                <span className="big">{wxIcon(wxCur)}</span>
                <div className="now">
                  <b>{wxText(wxCur)} {wxCur?.temperature}°C</b>
                  <span>강수 {wxCur?.precipitationProbability}% · 습도 {wxCur?.humidity}%</span>
                </div>
                <div className="extra">
                  <span>🌬 {wxCur?.windSpeed}m/s</span><span>💧 {wxCur?.precipitationProbability}%</span>
                  <span>🌅 {fmtClock(sun?.sunrise)}</span><span>🌇 {fmtClock(sun?.sunset)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ───── 우측: AI 어시스턴트 (플로팅) ───── */}
        {aiOpen ? (
          <div className="md-ai">
            <div className="ai-head">
              <span className="ai-av">⛰</span>
              <div className="ai-t">
                <b>나랑등산 AI</b>
                <span>NARANG · TRAIL ASSISTANT</span>
              </div>
              <button className="ai-x" onClick={() => setAiOpen(false)} title="닫기">✕</button>
            </div>
            <div className="ai-body">
              {aiMsgs.map((m, i) => (
                <div key={i} className={'ai-msg ' + m.role}>{m.text}</div>
              ))}
            </div>
            <div className="ai-chips">
              {aiChips.map((c) => <span key={c} className="chip">{c}</span>)}
            </div>
            {/* TODO(AI): 입력/전송 → AI 어시스턴트 API 연동 */}
            <div className="ai-input">
              <input placeholder="궁금한 점을 물어보세요…" />
              <button className="send" title="전송">➤</button>
            </div>
          </div>
        ) : (
          <button className="md-ai-fab" onClick={() => setAiOpen(true)} title="AI 어시스턴트 열기">💬</button>
        )}
      </div>
    </div>
  );
}
