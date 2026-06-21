import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../context/AuthContext.jsx';

const PAGE_SIZE = 15;

export default function SuggestionBoardPage() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [keyword, setKeyword] = useState('');
  const [input, setInput]     = useState('');
  const [page, setPage]       = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params = new URLSearchParams({ category: 'feedback' });
    if (keyword) params.append('keyword', keyword);

    apiFetch(`/api/board?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('건의글을 불러오지 못했습니다.');
        return res.json();
      })
      .then((json) => setPosts(json.data ?? json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [keyword]);

  const search = () => setKeyword(input);

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const pagePosts  = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <span className="here">건의게시판</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">SUGGESTION BOARD</div>
        <h1>건의게시판</h1>
        <p className="desc">없는 산·경로나 개선 아이디어를 남겨주세요. 관리자가 검토 후 반영합니다.</p>
      </div>

      <div className="board-tabs">
        <Link to="/board">자유게시판</Link>
        <Link to="/suggestions" className="on">건의게시판</Link>
      </div>

      <div className="suggest-cta" style={{ marginTop: 18 }}>
        <div className="ic">📮</div>
        <div className="tx">
          <h3>이런 코스가 빠졌어요!</h3>
          <p>등록되지 않은 산이나 잘못된 경로 정보를 알려주시면 빠르게 반영하겠습니다.</p>
        </div>
        <Link className="btn pop" to="/suggestions/write">건의하러 가기 →</Link>
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
            <Link className="btn pop sm" to="/suggestions/write">✏ 건의하기</Link>
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
              ? <p style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>건의글이 없습니다.</p>
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

        {!loading && !error && (
          <div className="pagination">
            <span
              className={'pg ghost' + (page === 1 ? ' disabled' : '')}
              onClick={() => page > 1 && setPage(page - 1)}
            >←</span>
            {getPageNums().map((n) => (
              <span key={n} className={'pg' + (n === page ? ' on' : '')} onClick={() => setPage(n)}>{n}</span>
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
