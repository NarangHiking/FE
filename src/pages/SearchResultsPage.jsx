import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import MountainCard from '../components/MountainCard.jsx';
import { mtnToCard } from '../data/mountains.js';
import { apiFetch } from '../context/AuthContext.jsx';

// 'YYYY…' → 'MM.DD' 류 표시 (BE createdAt 포맷이 다양해도 앞부분만)
const fmtDate = (s) => (s ? String(s).replace(/[^0-9]/g, '').slice(4, 8).replace(/(\d\d)(\d\d)/, '$1.$2') : '');
const catLabel = (c) => (c === 'feedback' ? '건의' : '자유');

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';
  const [tab, setTab] = useState('전체');
  const [text, setText] = useState(q);

  // 산: 전체 목록 1회 조회 후 클라이언트 필터 (BE에 산 이름검색 엔드포인트 없음)
  const [allMtns, setAllMtns] = useState([]);
  useEffect(() => {
    apiFetch('/api/mtn/list')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j) setAllMtns(j.data ?? j); })
      .catch(() => {});
  }, []);

  // 게시글: 키워드 검색 (카테고리 없이 전체) — GET /api/board?keyword={q}
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.append('keyword', q);
    apiFetch(`/api/board?${p}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (j) setPosts(j.data ?? j); })
      .catch(() => {});
  }, [q]);

  const mtns = q
    ? allMtns.filter((m) => (m.name?.includes(q) || m.location?.includes(q)))
    : allMtns;
  const total = mtns.length + posts.length;

  const onSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(text)}`);
  };

  const showMtn = tab === '전체' || tab === '산';
  const showPost = tab === '전체' || tab === '게시글';

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span><span className="here">검색</span>
      </div>

      {/* 검색 헤더 */}
      <div className="page-head">
        <div className="eyebrow">SEARCH RESULTS</div>
        <h1>{q ? `‘${q}’ 검색 결과` : '검색'}</h1>
        <p className="desc">산 <b>{mtns.length}</b>곳 · 게시글 <b>{posts.length}</b>건 — 총 {total}건을 찾았어요.</p>
      </div>

      {/* 큰 검색창 */}
      <form className="searchbar" onSubmit={onSubmit} style={{ margin: '8px 0 6px', maxWidth: 760 }}>
        <div className="cat">⛰ 통합검색 <span style={{ opacity: 0.5 }}>▾</span></div>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="산 이름, 지역, 게시글…" />
        <button type="submit">검색</button>
      </form>

      {/* 결과 탭 */}
      <div className="tab-bar">
        {[`전체 ${total}`, `산 ${mtns.length}`, `게시글 ${posts.length}`].map((label) => {
          const key = label.split(' ')[0];
          return (
            <button key={key} className={'tab' + (tab === key ? ' on' : '')} onClick={() => setTab(key)}>{label}</button>
          );
        })}
      </div>

      {total === 0 && (
        <div className="empty-state">
          <div className="es-ic">🧭</div>
          <div className="es-t">{q ? `‘${q}’에 대한 결과가 없어요` : '검색어를 입력해 보세요'}</div>
          <p className="es-s">철자를 확인하거나 더 짧은 검색어로 다시 시도해 보세요.</p>
          <div className="quick" style={{ justifyContent: 'center' }}>
            <span className="lab">인기 검색</span>
            {['북한산', '관악산', '서울', '지리산'].map((k) => (
              <Link key={k} className="chip" to={`/search?q=${k}`}>{k}</Link>
            ))}
          </div>
        </div>
      )}

      {/* 산 결과 */}
      {showMtn && mtns.length > 0 && (
        <section className="sec" style={{ padding: '12px 0' }}>
          <div className="sec-head">
            <div className="l"><span className="num">⛰</span><h2>산 {mtns.length}</h2></div>
            <Link className="more" to="/mountains">산 목록 전체 →</Link>
          </div>
          <div className="grid">
            {mtns.map((m, i) => (
              <MountainCard key={m.id} m={mtnToCard(m)} sceneVariant={i + 71} showRank={false} />
            ))}
          </div>
        </section>
      )}

      {/* 게시글 결과 */}
      {showPost && posts.length > 0 && (
        <section className="sec" style={{ padding: '12px 0 40px' }}>
          <div className="sec-head">
            <div className="l"><span className="num">📋</span><h2>게시글 {posts.length}</h2></div>
            <Link className="more" to="/board">게시판 전체 →</Link>
          </div>
          <div className="board-table">
            <div className="thead">
              <span>분류</span><span>제목</span><span>작성자</span><span>작성</span><span>댓글</span>
            </div>
            {posts.map((p) => (
              <Link key={p.id} className="board-row" to={`/board/${p.id}`}>
                <span className={'b-tag ' + (p.category === 'feedback' ? 'q' : '')}>{catLabel(p.category)}</span>
                <span className="b-title">{p.title}{p.commentCount > 0 && <span className="cmt">[{p.commentCount}]</span>}</span>
                <span className="b-meta">{p.name}</span>
                <span className="b-meta">{fmtDate(p.createdAt)}</span>
                <span className="b-num">{p.commentCount}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
