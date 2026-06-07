import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import MountainCard from '../components/MountainCard.jsx';
import { MOUNTAINS } from '../data/mountains.js';
import { FREE_POSTS } from '../data/posts.js';

function tagClass(tag) {
  if (tag === '후기') return 'review';
  if (tag === '질문') return 'q';
  if (tag === '정보') return 'info';
  return '';
}

export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';
  const [tab, setTab] = useState('전체');
  const [text, setText] = useState(q);

  // 디자인용 단순 필터(부분일치). 결과 없으면 빈 상태 화면.
  const hit = (s) => !q || s.includes(q);
  const mtns = MOUNTAINS.filter((m) => hit(m.name) || hit(m.region));
  const posts = FREE_POSTS.filter((p) => hit(p.title) || hit(p.author));
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
          <div className="es-t">‘{q}’에 대한 결과가 없어요</div>
          <p className="es-s">철자를 확인하거나 더 짧은 검색어로 다시 시도해 보세요.</p>
          <div className="quick" style={{ justifyContent: 'center' }}>
            <span className="lab">인기 검색</span>
            {['북한산', '관악산', '서울 근교', '초보 코스'].map((k) => (
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
              <MountainCard key={m.id} m={m} sceneVariant={i + 71} showRank={false} />
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
              <span>분류</span><span>제목</span><span>작성자</span><span>작성</span><span>댓글</span><span>조회</span>
            </div>
            {posts.map((p) => (
              <Link key={p.id} className="board-row" to="/board">
                <span className={'b-tag ' + tagClass(p.tag)}>{p.tag}</span>
                <span className="b-title">{p.title}{p.cm > 0 && <span className="cmt">[{p.cm}]</span>}</span>
                <span className="b-meta">{p.author}</span>
                <span className="b-meta">{p.time}</span>
                <span className="b-num">{p.cm}</span>
                <span className="b-num">{p.views}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
