import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import MountainCard from '../components/MountainCard.jsx';
import { TrailMap, ElevationProfile, buildRoute } from '../components/TrailMap.jsx';
import { getMountain, MOUNTAINS } from '../data/mountains.js';
import { REVIEWS } from '../data/posts.js';

const ROUTES = [
  { name: '백운대 정규 코스', meta: '대표 · 원점회귀', km: 5.2, summit: 836, lv: '중급', lvN: 2, loop: true },
  { name: '사패산 능선 코스', meta: '종주 · 편도', km: 8.1, summit: 740, lv: '상급', lvN: 3, loop: false },
  { name: '둘레길 순환 코스', meta: '입문 · 원점회귀', km: 3.4, summit: 410, lv: '초급', lvN: 1, loop: true },
];

const WAYPOINTS = [
  { cls: 'start', nm: '탐방지원센터 (출발)', info: '0.0km · 고도 180m · 09:00' },
  { cls: '', nm: '약수터', info: '1.4km · 고도 420m · 09:50' },
  { cls: '', nm: '갈림길 (백운대 방면)', info: '2.6km · 고도 610m · 10:35' },
  { cls: 'peak', nm: '백운대 정상 ▲', info: '3.2km · 고도 836m · 11:20' },
  { cls: '', nm: '전망 바위', info: '4.1km · 고도 590m · 12:05' },
  { cls: '', nm: '탐방지원센터 (도착)', info: '5.2km · 고도 180m · 13:10' },
];

const SCORE_BARS = [
  { lab: '경치', pct: 96 },
  { lab: '접근성', pct: 82 },
  { lab: '난이도', pct: 64 },
  { lab: '관리상태', pct: 88 },
];

export default function MountainDetailPage() {
  const { id } = useParams();
  const m = getMountain(id);
  const [tab, setTab] = useState(0);
  const [fav, setFav] = useState(false);

  // TODO(BE): 산 상세 — GET /mtn/{id} (이름/위치/고도/설명/이미지)
  // TODO(BE): 경로(코스) 목록 — GET /mtn/{mtnId}/track → 아래 ROUTES 더미를 교체.
  //   탭 선택 시 GET /track/{trackId} 로 상세(gpxFilePath, recommendCnt) 로드.
  // TODO(BE): 저장(찜) 상태 — 진입 시 GET /favorite/{trackId} 로 fav 초기화.
  //   저장 토글 → POST /favorite/{trackId} / DELETE /favorite/{trackId}.
  //   '추천(좋아요)' 이 필요하면 GET/POST/DELETE /recommend/{trackId}.
  // TODO(BE): 별점 리뷰 섹션은 BE 스키마에 없음 → 리뷰 API 추가 또는 board(category) 활용.

  const route = ROUTES[tab];
  // TODO(BE): 지도/고도 그래프는 현재 buildRoute() 더미. 실제 track.gpxFilePath 의
  //   GPX(XML)를 fetch·파싱해 좌표/고도 배열로 만들어 TrailMap/ElevationProfile 에 전달.
  const builtRoute = useMemo(
    () => buildRoute(m.id * 7 + tab, { km: route.km, summit: route.summit, loop: route.loop, points: 13 }),
    [m.id, tab, route.km, route.summit, route.loop]
  );
  const related = MOUNTAINS.filter((x) => x.id !== m.id).slice(0, 4);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span>
        <Link to="/mountains">산 목록</Link><span className="sep">/</span>
        <span className="here">{m.name}</span>
      </div>

      {/* ───── 상세 히어로 ───── */}
      <section className="d-hero">
        <div>
          <div className="meta-tags">
            <span className="tag green">📍 {m.region}</span>
            <span className="tag">고도 {m.ele}m</span>
            <span className="tag pop">GPX 제공</span>
          </div>
          <h1>{m.name}</h1>
          <div className="hanja">{m.hanja} · {m.region}</div>
          <p className="desc">
            능선 조망이 뛰어난 {m.region}의 대표 명산. 화강암 봉우리와 사계절 다른 풍경으로 사랑받는 코스입니다.
            GPX 트랙으로 출발지·고도·갈림길을 미리 확인하고 안전하게 다녀오세요.
          </p>

          <div className="stat-strip">
            <div className="st"><div className="k">대표 거리</div><div className="v">{m.dist}</div></div>
            <div className="st"><div className="k">소요</div><div className="v">{m.time}</div></div>
            <div className="st"><div className="k">난이도</div><div className="v">{m.lv}</div></div>
            <div className="st"><div className="k">최고 고도</div><div className="v">{m.ele}<small>m</small></div></div>
          </div>

          <div className="act-row">
            {/* TODO(BE): GPX 다운로드 → 현재 선택된 track 의 gpxFilePath 로 연결 */}
            <a className="act pop" href="#route">⬇ GPX 다운로드</a>
            {/* TODO(BE): 저장 토글 → POST/DELETE /favorite/{trackId} (비로그인 시 로그인 유도) */}
            <button className={'act fav' + (fav ? ' on' : '')} onClick={() => setFav((v) => !v)}>♥ 저장</button>
            <button className="act">🔗 공유</button>
            <button className="act">🚩 신고</button>
          </div>
        </div>

        <div className="photo">
          <MountainScene variant={m.id + 30} palette={m.pal} w={440} h={340} />
          <div className="ht" />
          <span className="cap">📷 {m.name} 정상부 · 비공식 자료</span>
        </div>
      </section>

      {/* ───── 코스 정보 ───── */}
      <section className="d-main" id="route">
        <div>
          <div className="blk-head">
            <span className="num">01</span>
            <h2>코스 & 지도</h2>
            <span className="sub">— 경로를 선택하면 지도·고도가 함께 바뀝니다</span>
          </div>

          <div className="route-tabs">
            {ROUTES.map((r, i) => (
              <button key={r.name} className={'rtab' + (i === tab ? ' on' : '')} onClick={() => setTab(i)}>
                <span>{r.name}</span>
                <span className="rk">{r.meta} · {r.km}km</span>
              </button>
            ))}
          </div>

          <div className="map-card">
            <div className="map">
              <TrailMap route={builtRoute} w={760} h={380} />
              <div className="legend">
                <div className="li"><span className="sw start" />출발지</div>
                <div className="li"><span className="sw peak" />정상</div>
                <div className="li"><span className="sw end" />{route.loop ? '원점회귀' : '종착지'}</div>
                <div className="li"><span className="sw route" />GPX 경로</div>
              </div>
            </div>
            <div className="elev-wrap">
              <div className="eh">
                <span className="t">고도 프로필 · ELEVATION</span>
                <span className="t">최고 {route.summit}m</span>
              </div>
              <ElevationProfile route={builtRoute} w={760} h={150} />
            </div>
          </div>

          <div className="rstat">
            <div className="c"><div className="k">거리</div><div className="v">{route.km}km</div></div>
            <div className="c"><div className="k">소요</div><div className="v">{m.time}</div></div>
            <div className="c"><div className="k">최고 고도</div><div className="v">{route.summit}m</div></div>
            <div className="c"><div className="k">누적 상승</div><div className="v">{Math.round(route.summit * 1.3)}m</div></div>
            <div className="c"><div className="k">난이도</div><div className={`v lv${route.lvN}`}>{route.lv}</div></div>
          </div>

          <div className="blk-head" style={{ marginTop: 28 }}>
            <span className="num">02</span>
            <h2>주요 경유지</h2>
            <span className="sub">— 코스 타임라인</span>
          </div>
          <div className="timeline">
            {WAYPOINTS.map((w) => (
              <div key={w.nm} className={'tl-item ' + w.cls}>
                <div className="nm">{w.nm}</div>
                <div className="info">{w.info}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 사이드바 */}
        <aside className="side">
          <div className="scard">
            <div className="sh"><h3>GPX 다운로드</h3><span className="mono">.GPX</span></div>
            <div className="sb">
              <div className="gpx-box">
                <div className="ic">GPX</div>
                <div className="tx">
                  <div className="n">{m.name}_{route.name}.gpx</div>
                  <div className="s">{route.km}km · {builtRoute.pts.length} 포인트</div>
                </div>
                <a className="btn pop sm" href="#">받기</a>
              </div>
            </div>
          </div>

          <div className="scard">
            <div className="sh"><h3>오늘의 날씨</h3><span className="mono">WEATHER</span></div>
            <div className="sb">
              <div className="wx">
                <div className="big">⛅</div>
                <div className="col">
                  <div className="temp">18°</div>
                  <div className="desc">대체로 맑음 · 입산 적합</div>
                </div>
              </div>
              <div className="wx-grid">
                <div className="wi"><div className="k">체감</div><div className="v">16°</div></div>
                <div className="wi"><div className="k">바람</div><div className="v">3 m/s</div></div>
                <div className="wi"><div className="k">강수</div><div className="v">10%</div></div>
                <div className="wi"><div className="k">일몰</div><div className="v">19:24</div></div>
              </div>
            </div>
          </div>

          <div className="scard">
            <div className="sh"><h3>현장 사진</h3><span className="mono">GALLERY</span></div>
            <div className="sb">
              <div className="gallery">
                <div className="g"><MountainScene variant={m.id + 41} palette="forest" w={150} h={84} /></div>
                <div className="g"><MountainScene variant={m.id + 42} palette="dawn" w={150} h={84} /></div>
                <div className="g"><MountainScene variant={m.id + 43} palette="alpine" w={150} h={84} /></div>
                <div className="g more">+24장</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* ───── 리뷰 ───── */}
      <section className="reviews">
        <div className="blk-head">
          <span className="num">03</span>
          <h2>등산 후기</h2>
          <span className="sub">— 다녀온 사람들의 한 줄</span>
        </div>

        <div className="rev-top">
          <div className="score-box">
            <div className="big">4.7</div>
            <div className="stars">★★★★★</div>
            <div className="n">리뷰 312개</div>
          </div>
          <div className="bars">
            {SCORE_BARS.map((b) => (
              <div className="bar-row" key={b.lab}>
                <span className="lab">{b.lab}</span>
                <span className="track"><span className="fill" style={{ width: `${b.pct}%` }} /></span>
                <span className="pct">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* TODO(BE): 리뷰 작성/목록은 BE에 전용 API 없음. 리뷰 도메인 추가하거나
            board(category=REVIEW, trackId 연결)로 대체 후 연동. */}
        <div className="rev-write">
          <div className="av">나</div>
          <input placeholder={`${m.name} 다녀오셨나요? 후기를 남겨주세요`} />
          <button className="btn pop sm">등록</button>
        </div>

        <div className="rev-list">
          {REVIEWS.map((r, i) => (
            <div className="rev" key={i}>
              <div className="top">
                <div className="av">{r.av}</div>
                <div>
                  <div className="who">{r.who}</div>
                  <div className="when">{r.when}</div>
                </div>
                <div className="rstars">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
              </div>
              <div className="body">{r.body}</div>
              <div className="rt">🏷 {r.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── 비슷한 산 ───── */}
      <section className="related">
        <div className="sec-head">
          <div className="l"><span className="num">04</span><h2>비슷한 산</h2></div>
          <Link className="more" to="/mountains">전체 보기 →</Link>
        </div>
        <div className="grid">
          {related.map((rm, i) => (
            <MountainCard key={rm.id} m={rm} sceneVariant={i + 51} showRank={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
