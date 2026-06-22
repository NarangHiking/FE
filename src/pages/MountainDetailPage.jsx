import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import TrailLeafletMap from '../components/TrailLeafletMap.jsx';
import { MOUNTAINS } from '../data/mountains.js';
import { apiFetch, useAuth } from '../context/AuthContext.jsx';
import { imageUrl } from '../utils/image.js';

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
// 'YYYYMMDD' → 오늘/내일/모레/MM.DD(요일)
const dayLabel = (ymd) => {
  if (!ymd) return '';
  const d = new Date(Number(ymd.slice(0, 4)), Number(ymd.slice(4, 6)) - 1, Number(ymd.slice(6, 8)));
  const now = new Date();
  const diff = Math.round((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  if (diff === 2) return '모레';
  const w = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${ymd.slice(4, 6)}.${ymd.slice(6, 8)}(${w})`;
};

// BE Track → 코스 탭 포맷 변환 (km·lv 는 BE Track 에 없어 더미)
function toRoute(track, fallbackSummit) {
  return {
    id: track.id,
    name: track.name,
    summit: fallbackSummit,
    gpxFilePath: track.gpxFilePath,
    gpxUrl: track.gpxUrl ?? null, // BE가 주는 전체 URL
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
  const [aiOpen, setAiOpen] = useState(false); // 처음엔 닫힌 상태(FAB만 표시)
  const [imgOk, setImgOk] = useState(true); // 대표 이미지 로드 성공 여부

  // 날씨(시간대별) + 일출/일몰
  const [weather, setWeather] = useState([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [wxIdx, setWxIdx] = useState(0);
  const [wxErr, setWxErr] = useState(false);
  const [sun, setSun] = useState(null);
  const [wxDetail, setWxDetail] = useState(false); // 날씨 간단히(기본) ↔ 자세히 보기

  // 트랙(코스)별 댓글
  const [comments, setComments] = useState([]);
  const [cmtText, setCmtText] = useState('');
  const [cmtFiles, setCmtFiles] = useState([]);
  const [cmtBusy, setCmtBusy] = useState(false);
  const fileRef = useRef(null);

  // 후기 사진: BE 가 imageUrls(전체 URL 배열) 제공. 구버전(images: ImageResponse[]) 도 폴백 지원.
  const commentImgs = (c) =>
    Array.isArray(c.imageUrls) ? c.imageUrls
      : Array.isArray(c.images) ? c.images.map((im) => (typeof im === 'string' ? im : (im?.imageUrl ?? im?.url ?? '')))
      : [];

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
      .then((j) => { setWeather(j.data ?? j); setDayIdx(0); setWxIdx(0); })
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

  // 산 바뀌면 대표 이미지 에러 상태 리셋
  useEffect(() => { setImgOk(true); }, [mtn?.storedFilename]);

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

  // 단기예보(최대 3일) → 일자별 그룹 + 일 최저/최고 + 3시간 간격 슬롯
  const byDay = useMemo(() => {
    const map = new Map();
    for (const w of weather) {
      if (!map.has(w.fcstDate)) map.set(w.fcstDate, []);
      map.get(w.fcstDate).push(w);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, hrs]) => {
        hrs.sort((a, b) => a.fcstTime.localeCompare(b.fcstTime));
        const temps = hrs.map((h) => parseInt(h.temperature, 10)).filter(Number.isFinite);
        const slots = hrs.filter((h) => Number(h.fcstTime.slice(0, 2)) % 3 === 0).slice(0, 8);
        return {
          date,
          label: dayLabel(date),
          slots: slots.length ? slots : hrs.slice(0, 8),
          min: temps.length ? Math.min(...temps) : null,
          max: temps.length ? Math.max(...temps) : null,
        };
      });
  }, [weather]);

  if (loading) return <div className="wrap" style={{ padding: 60, textAlign: 'center' }}>불러오는 중…</div>;
  if (error) return <div className="wrap" style={{ padding: 60, textAlign: 'center', color: 'var(--pop)' }}>{error}</div>;
  if (!mtn) return null;

  const pal = PALETTES[mtn.id % PALETTES.length];
  const heroImg = imageUrl(mtn.imageUrl ?? mtn.storedFilename); // 전체 URL(imageUrl) 우선
  const route = routes[tab];
  const gpxHref = route?.gpxUrl || imageUrl(route?.gpxFilePath || ''); // 전체 URL 우선, 없으면 키→URL

  // ── 지도 좌표 ──
  // TODO(BE): Mtn DTO 에 lat/lng 추가 권장. 현재는 더미 좌표표에서 이름으로 매칭, 없으면 북한산.
  const coord = MOUNTAINS.find((x) => x.name === mtn.name);
  const lat = mtn.lat ?? coord?.lat ?? 37.6586;
  const lng = mtn.lng ?? coord?.lng ?? 126.9779;

  // ── AI 어시스턴트 (디자인용 정적 대화) ──
  // TODO(AI): 실제 어시스턴트 연동(Claude API 등). BE 레포엔 없음 → 별도 AI 서비스 필요.
  const aiMsgs = [
    { role: 'bot', text: `${mtn.name}은(는) 서울 도심에서 가장 가까운 국립공원이에요. ${mtn.height}m가 최고봉이며, 주능선 코스가 가장 인기 있습니다. 왕복 약 4~5시간 소요됩니다.` },
    { role: 'user', text: '준비물 알려줘' },
    { role: 'bot', text: '필수 준비물로는 등산화, 등산스틱, 여벌 옷, 충분한 물(1인 1.5L 이상), 간식, 구급약, 지도 또는 GPS를 챙기시길 추천드려요!' },
  ];
  const aiChips = ['날씨 확인', '초보 코스 추천', '준비물 알려줘', `${mtn.name} 정보`];

  // 선택한 날의 시간대별 슬롯 + 선택 시각
  const wxDay = byDay[Math.min(dayIdx, Math.max(0, byDay.length - 1))] ?? null;
  const wxSlots = wxDay?.slots ?? [];
  const wxCur = wxSlots[wxIdx] ?? wxSlots[0] ?? null;

  return (
    <div className="md">
      {/* ───── 좌측: 정보 + 후기 ───── */}
      <aside className="md-left">
        <div className="md-hero">
          {heroImg && imgOk ? (
            <img className="md-hero-img" src={heroImg} alt={mtn.name} onError={() => setImgOk(false)} />
          ) : (
            <MountainScene variant={(mtn.id ?? 1) + 30} palette={pal} w={384} h={196} />
          )}
          <div className="ht" />
          <div className="veil" />
          {mtn.imageSource && heroImg && imgOk && (
            <span className="md-hero-src">© {mtn.imageSource}</span>
          )}
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

          {/* 댓글 작성: 후기는 코스(track)별이라 코스가 없으면 작성 불가 */}
          {!route ? (
            <p className="md-cmt-empty">이 산에는 등록된 코스가 없어 후기를 작성할 수 없어요. (후기는 코스별로 작성됩니다)</p>
          ) : user ? (
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
            [...comments]
              .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)) || (a.id - b.id))
              .map((c) => (
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
                {commentImgs(c).length > 0 && (
                  <div className="rphotos">
                    {commentImgs(c).map((u, k) => (
                      <a className="rphoto" key={k} href={u} target="_blank" rel="noreferrer">
                        <img src={u} alt="" />
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
        {/* 코스 바뀌면 key로 지도 리마운트 → GPX 다시 로드/맞춤 */}
        <TrailLeafletMap key={route?.id ?? 'none'} center={[lat, lng]} gpxUrl={gpxHref} />

        {/* 코스 + 날씨 플로팅 카드 */}
        <div className="md-course-card">
          <div className="cc-eyebrow">🥾 선택 코스</div>
          <div className="cc-top">
            <div className="cc-title">{route ? route.name : '등록된 코스 없음'}</div>
            <div className="cc-actions">
              {gpxHref && (
                <a className="cc-save" href={gpxHref} download title="GPX 다운로드">⬇ GPX</a>
              )}
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

          <div className="cc-wx-label">
            🌤 단기예보 (최대 3일)
            {byDay.length > 0 && (
              <button className="wx-toggle" onClick={() => setWxDetail((v) => !v)}>
                {wxDetail ? '간단히 보기 ▴' : '자세히 보기 ▾'}
              </button>
            )}
          </div>
          {byDay.length === 0 ? (
            <div className="wx-empty">{wxErr ? '날씨 정보를 불러올 수 없어요' : '날씨 정보를 불러오는 중…'}</div>
          ) : (
            <>
              {/* 일자 탭 (오늘/내일/모레) */}
              <div className="wx-dayrow">
                {byDay.map((d, i) => (
                  <button key={d.date} className={'wx-daytab' + (i === dayIdx ? ' on' : '')}
                    onClick={() => { setDayIdx(i); setWxIdx(0); }}>
                    <span className="dl">{d.label}</span>
                    {d.max != null && <span className="dt">{d.max}° / {d.min}°</span>}
                  </button>
                ))}
              </div>

              {/* 선택한 날의 시간대별 — 자세히 보기에서만 */}
              {wxDetail && (
                <div className="wx-days">
                  {wxSlots.map((w, i) => (
                    <div key={i} className={'wx-day' + (i === wxIdx ? ' on' : '')} onClick={() => setWxIdx(i)}>
                      <div className="wd">{fmtHour(w.fcstTime)}</div>
                      <div className="we">{wxIcon(w)}</div>
                      <div className="wt">{w.temperature}°</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="wx-summary">
                <span className="big">{wxIcon(wxCur)}</span>
                <div className="now">
                  <b>{wxText(wxCur)} {wxCur?.temperature}°C</b>
                  <span>{wxDay?.max != null ? `최고 ${wxDay.max}° · 최저 ${wxDay.min}°` : ''}</span>
                </div>
                {/* 강수/습도/바람/일출일몰 — 자세히 보기에서만 */}
                {wxDetail && (
                  <div className="extra">
                    <span>💧 강수 {wxCur?.precipitationProbability}%</span><span>💦 습도 {wxCur?.humidity}%</span>
                    <span>🌬 바람 {wxCur?.windSpeed}m/s</span>
                    <span>🌅 {fmtClock(sun?.sunrise)} · 🌇 {fmtClock(sun?.sunset)}</span>
                  </div>
                )}
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
