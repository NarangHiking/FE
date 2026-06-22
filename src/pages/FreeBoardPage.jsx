import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../context/AuthContext.jsx';

const PAGE_SIZE = 15; // 한 페이지에 표시할 게시글 수

export default function FreeBoardPage() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage]       = useState(1); // 현재 페이지 (1-based)

  const [input, setInput] = useState('');

  useEffect(() => {
    setLoading(true);
    setPage(1); // 검색어 바뀌면 1페이지로 초기화
    const params = new URLSearchParams({ category: 'free' });
    if (keyword) params.append('keyword', keyword);

    apiFetch(`/api/board?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('게시글을 불러오지 못했습니다.');
        return res.json();
      })
      .then((json) => setPosts(json.data ?? json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [keyword]);

  const search = () => setKeyword(input);

  // 항상 최신순(작성 시각 내림차순, 동일 시 id 내림차순)으로 표시
  const sortedPosts = [...posts].sort(
    (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || (b.id - a.id),
  );

  // ── 페이지네이션 계산 ─────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
  const pagePosts   = sortedPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 페이지 번호 목록: 현재 페이지 기준 앞뒤 2개씩, 최대 5개
  function getPageNums() {
    const nums = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span>
        <Link to="/board">게시판</Link><span className="sep">/</span>
        <span className="here">자유게시판</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">FREE BOARD</div>
        <h1>자유게시판</h1>
        <p className="desc">등산러들이 후기·질문·정보를 나누는 공간입니다.</p>
      </div>

      <div className="board-tabs">
        <Link to="/board" className="on">자유게시판</Link>
        <Link to="/suggestions">건의게시판</Link>
      </div>

      <div className="board-shell">
        <div className="board-toolbar">
          <div className="left" />
          <div className="left">
            <div className="search-mini">
              <span>🔍</span>
              <input
                placeholder="게시판 내 검색"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
              />
            </div>
            <Link className="btn pop sm" to="/board/write">✏ 글쓰기</Link>
          </div>
        </div>

        {loading && <p style={{ padding: 40, textAlign: 'center' }}>불러오는 중…</p>}
        {error   && <p style={{ padding: 40, textAlign: 'center', color: 'var(--pop)' }}>{error}</p>}

        {!loading && !error && (
          <div className="board-table">
            <div className="thead">
              <span>작성자</span><span>제목</span><span>작성</span><span>댓글</span>
            </div>
            {pagePosts.length === 0
              ? <p style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>게시글이 없습니다.</p>
              : pagePosts.map((p) => (
                <Link key={p.id} className="board-row" to={`/board/${p.id}`}>
                  <span className="b-meta">{p.name}</span>
                  <span className="b-title">
                    {p.title}
                    {p.trackName && <span className="trk">🥾 {p.trackName}</span>}
                    {p.commentCount > 0 && <span className="cmt">[{p.commentCount}]</span>}
                  </span>
                  <span className="b-meta">{p.createdAt}</span>
                  <span className="b-num">{p.commentCount}</span>
                </Link>
              ))
            }
          </div>
        )}

        {/* 페이지네이션 — 페이지가 2개 이상일 때만 표시 */}
        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <span
              className={'pg ghost' + (page === 1 ? ' disabled' : '')}
              onClick={() => page > 1 && setPage(page - 1)}
            >←</span>

            {getPageNums().map((n) => (
              <span
                key={n}
                className={'pg' + (n === page ? ' on' : '')}
                onClick={() => setPage(n)}
              >{n}</span>
            ))}

            <span
              className={'pg ghost' + (page === totalPages ? ' disabled' : '')}
              onClick={() => page < totalPages && setPage(page + 1)}
            >→</span>
          </div>
        )}
      </div>
    </div>
  );
}
