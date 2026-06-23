import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import MountainCard from '../components/MountainCard.jsx';
import { REGIONS, mtnToCard, matchesRegion } from '../data/mountains.js';
import { apiFetch } from '../context/AuthContext.jsx';
import { imageUrl } from '../utils/image.js';

const QUICK = ['북한산', '관악산', '지리산', '한라산', '설악산'];

// 'YYYY-MM-DD…' / 'YYYY.MM.DD' → 'MM.DD'
const fmtDate = (s) => (s ? String(s).replace(/[-/]/g, '.').slice(5, 10) : '');

export default function MainPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  // 자유게시판 최신 글 미리보기 — GET /api/board?category=free
  const [freePosts, setFreePosts] = useState([]);
  useEffect(() => {
    apiFetch('/api/board?category=free')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => { if (json) setFreePosts(json.data ?? json); })
      .catch(() => {});
  }, []);

  // 산 목록 — GET /api/mtn/list (이달의 산 = 첫 항목, 인기 산 = 앞 8개)
  const [mtns, setMtns] = useState([]);
  useEffect(() => {
    apiFetch('/api/mtn/list')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => { if (json) setMtns(json.data ?? json); })
      .catch(() => {});
  }, []);
  const featured = mtns[0];
  const featImg = featured ? imageUrl(featured.imageUrl ?? featured.storedFilename) : '';
  const [featImgOk, setFeatImgOk] = useState(true);
  useEffect(() => { setFeatImgOk(true); }, [featImg]); // 산 바뀌면 이미지 에러 상태 리셋

  // 코스(track) 목록 — 전체/지역별 코스 수 집계용 (GET /api/track)
  const [tracks, setTracks] = useState([]);
  useEffect(() => {
    apiFetch('/api/track')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => { if (json) setTracks(json.data ?? json); })
      .catch(() => {});
  }, []);

  // 산 id → location 맵 → 코스의 소속 지역 판정에 사용
  const mtnById = useMemo(
    () => Object.fromEntries((mtns ?? []).map((m) => [m.id, m])),
    [mtns],
  );
  // 지역별 코스 수 (해당 지역 산에 속한 트랙 수)
  const regionCount = (regionName) =>
    (tracks ?? []).filter((t) => matchesRegion(mtnById[t.mountainId]?.location, regionName)).length;

  const onSearch = (e) => {
    e.preventDefault();
    // TODO(BE): 검색 — 결과 페이지에서 GET /api/track/search?name= 또는 GET /api/board?keyword= 호출
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };
  return (
    <>
      {/* ───── HERO ───── */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="kicker"><span className="dot" />EST. 2026 · 비공식 등산 클럽</span>
            <h1>오늘,<br />어느 산<span className="o">?</span></h1>
            <p className="lead">산 이름·지역·거리로 GPX 트래킹 코스를 찾고, 능선 하나하나를 미리 걸어보세요.</p>

            <form className="searchbar" onSubmit={onSearch}>
              <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="예) 북한산, 백운대 코스…" />
              <button type="submit">검색</button>
            </form>

            <div className="quick">
              <span className="lab">인기 검색</span>
              {QUICK.map((k) => <Link key={k} className="chip" to={`/search?q=${encodeURIComponent(k)}`}>{k}</Link>)}
            </div>
          </div>

          {/* 입산 허가 도장 */}
          <div className="stamp" aria-hidden="true">
            <svg viewBox="0 0 150 150">
              <defs>
                <path id="circ" d="M 75 75 m -58 0 a 58 58 0 1 1 116 0 a 58 58 0 1 1 -116 0" />
              </defs>
              <text><textPath href="#circ" startOffset="0%">· 산림청 비공식 · CERTIFIED TRAIL CLUB · 입산 환영 ·</textPath></text>
            </svg>
            <div className="inner">
              <div>
                <div className="t1">입산<br />허가</div>
                <div className="t2">NO.0426</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── 이달의 산 ───── */}
      <section className="sec wrap">
        <div className="sec-head">
          <div className="l">
            <span className="num">01</span>
            <h2>이달의 산</h2>
            <span className="sub">— 지금 가장 걷기 좋은 능선</span>
          </div>
          <Link className="more" to="/mountains">전체 산 목록 →</Link>
        </div>

        {featured && (
          <Link className="feature" to={`/mountains/${featured.id}`}>
            {featImg && featImgOk ? (
              <img className="feature-img" src={featImg} alt={featured.name} onError={() => setFeatImgOk(false)} />
            ) : (
              <MountainScene variant={5} palette={mtnToCard(featured).pal} w={1180} h={340} />
            )}
            <div className="ht" />
            <div className="veil" />
            <div className="body">
              <div className="tagrow">
                <span className="ftag">이달의 산</span>
                <span className="ftag alt">추천 코스</span>
              </div>
              <h3>{featured.name}</h3>
              <div className="region">📍 {featured.location} · 고도 {featured.height}m</div>
              <div className="specs">
                <div className="s"><div className="k">고도</div><div className="v">{featured.height}m</div></div>
                <div className="s">
                  <div className="k">위치</div>
                  <div className="v" style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>{featured.location}</div>
                </div>
              </div>
              <span className="btn pop cta">코스 상세 보기 →</span>
            </div>
          </Link>
        )}
      </section>

      {/* ───── 인기 산 TOP 8 ───── */}
      <section className="sec wrap">
        <div className="sec-head">
          <div className="l">
            <span className="num">02</span>
            <h2>추천 산</h2>
            <span className="sub">— 지금 가볼 만한 산</span>
          </div>
          <Link className="more" to="/mountains">더 보기 →</Link>
        </div>
        <div className="grid">
          {mtns.slice(0, 8).map((m, i) => (
            <MountainCard key={m.id} m={{ ...mtnToCard(m), rank: i + 1 }} sceneVariant={i + 11} />
          ))}
        </div>
      </section>

      {/* ───── 커뮤니티 + 지역 ───── */}
      <section className="sec wrap">
        <div className="split">
          <div className="panel">
            <div className="ph">
              <h3>자유게시판</h3>
              <Link className="mono" to="/board" style={{ textDecoration: 'none', color: 'var(--ink-soft)' }}>최신 글 전체 →</Link>
            </div>
            {freePosts.length === 0 ? (
              <div className="post" style={{ justifyContent: 'center', color: 'var(--ink-soft)' }}>아직 등록된 글이 없어요</div>
            ) : (
              freePosts.slice(0, 5).map((p) => (
                <Link key={p.id} className="post" to={`/board/${p.id}`}>
                  <span className="tg">자유</span>
                  <span className="tt">{p.title}</span>
                  <span className="cm">💬{p.commentCount}</span>
                  <span className="ti">{fmtDate(p.createdAt)}</span>
                </Link>
              ))
            )}
          </div>

          <div className="panel">
            <div className="ph">
              <h3>지역으로 찾기</h3>
              <span className="mono">REGION</span>
            </div>
            <div className="regions">
              {REGIONS.map((r) => (
                <Link key={r.name} className="region-chip" to={`/mountains?region=${encodeURIComponent(r.name)}`}>
                  <span className="rn">{r.name}</span>
                  <span className="rc">{regionCount(r.name)} courses</span>
                </Link>
              ))}
            </div>
            <div className="pfoot">
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>전국 {tracks.length}개 코스 등록됨</span>
              <Link className="btn sm" to="/mountains">전체 보기</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
