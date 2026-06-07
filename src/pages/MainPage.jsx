import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import MountainCard from '../components/MountainCard.jsx';
import { MOUNTAINS, REGIONS, FEATURED } from '../data/mountains.js';
import { FREE_POSTS } from '../data/posts.js';

const QUICK = ['북한산', '관악산', '서울 근교', '당일치기', '초보 코스'];

export default function MainPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  // TODO(BE): 인기 산/이달의 산 데이터 — GET /api/mtn/list (필요시 추천순 정렬).
  //   useEffect 로 호출 후 setState → 아래 MOUNTAINS/FEATURED 더미를 응답으로 교체.
  //   커뮤니티 미리보기는 GET /api/board?category=FREE (최신 5건).
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
              <div className="cat">⛰ 산 이름 <span style={{ opacity: 0.5 }}>▾</span></div>
              <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="예) 북한산, 서울 근교, 5km 이하…" />
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

        <Link className="feature" to={`/mountains/${FEATURED.id}`}>
          <MountainScene variant={5} palette={FEATURED.pal} w={1180} h={340} />
          <div className="ht" />
          <div className="veil" />
          <div className="body">
            <div className="tagrow">
              <span className="ftag">이달의 산</span>
              <span className="ftag alt">단풍 절정</span>
            </div>
            <h3>{FEATURED.name}<br />{FEATURED.sub}</h3>
            <div className="region">📍 {FEATURED.region} · GPX {FEATURED.gpx}</div>
            <div className="specs">
              <div className="s"><div className="k">거리</div><div className="v">{FEATURED.dist}</div></div>
              <div className="s"><div className="k">소요</div><div className="v">{FEATURED.time}</div></div>
              <div className="s"><div className="k">난이도</div><div className="v">{FEATURED.lv}</div></div>
              <div className="s"><div className="k">고도</div><div className="v">{FEATURED.ele}</div></div>
            </div>
            <span className="btn pop cta">코스 상세 보기 →</span>
          </div>
        </Link>
      </section>

      {/* ───── 인기 산 TOP 8 ───── */}
      <section className="sec wrap">
        <div className="sec-head">
          <div className="l">
            <span className="num">02</span>
            <h2>인기 산 TOP 8</h2>
            <span className="sub">— 이번 주 가장 많이 검색된</span>
          </div>
          <Link className="more" to="/mountains">더 보기 →</Link>
        </div>
        <div className="grid">
          {MOUNTAINS.slice(0, 8).map((m, i) => (
            <MountainCard key={m.id} m={m} sceneVariant={i + 11} />
          ))}
        </div>
      </section>

      {/* ───── 커뮤니티 + 지역 ───── */}
      <section className="sec wrap">
        <div className="split">
          <div className="panel">
            <div className="ph">
              <h3>자유게시판</h3>
              <span className="mono">실시간 인기글</span>
            </div>
            {FREE_POSTS.slice(0, 5).map((p) => (
              <Link key={p.id} className="post" to="/board">
                <span className={'tg' + (p.tag === '후기' ? ' review' : p.tag === '질문' ? ' q' : '')}>{p.tag}</span>
                <span className="tt">{p.title}</span>
                <span className="cm">💬{p.cm}</span>
                <span className="ti">{p.time}</span>
              </Link>
            ))}
          </div>

          <div className="panel">
            <div className="ph">
              <h3>지역으로 찾기</h3>
              <span className="mono">REGION</span>
            </div>
            <div className="regions">
              {REGIONS.map((r) => (
                <Link key={r.name} className="region-chip" to="/mountains">
                  <span className="rn">{r.name}</span>
                  <span className="rc">{r.count} courses</span>
                </Link>
              ))}
            </div>
            <div className="pfoot">
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>전국 369개 코스 등록됨</span>
              <Link className="btn sm" to="/mountains">전체 보기</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
