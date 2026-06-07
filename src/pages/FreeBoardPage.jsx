import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FREE_POSTS } from '../data/posts.js';

const FILTERS = ['전체', '후기', '질문', '자유', '정보'];
const SORTS = ['최신순', '인기순', '댓글순'];

function tagClass(tag) {
  if (tag === '후기') return 'review';
  if (tag === '질문') return 'q';
  if (tag === '정보') return 'info';
  return '';
}

export default function FreeBoardPage() {
  const [filter, setFilter] = useState('전체');
  const [sort, setSort] = useState('최신순');
  // TODO(BE): 자유게시판 목록 — GET /api/board?category=FREE&keyword= (BE 카테고리 enum 확인)
  //   분류 칩(filter)/정렬(sort)/검색/페이지네이션 파라미터 반영해 재조회.
  //   각 행 클릭 → GET /api/board/{id} 상세. 글쓰기 버튼은 /board/write(FE 라우트) 로 이동(아래).
  const posts = filter === '전체' ? FREE_POSTS : FREE_POSTS.filter((p) => p.tag === filter);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span><span className="here">게시판</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">COMMUNITY BOARD</div>
        <h1>커뮤니티</h1>
        <p className="desc">등산러들이 후기·질문·정보를 나누는 공간입니다.</p>
      </div>

      {/* 게시판 탭 */}
      <div className="board-tabs">
        <Link to="/board" className="on">자유게시판</Link>
        <Link to="/suggestions">건의게시판</Link>
      </div>

      <div className="board-shell">
        {/* 툴바 */}
        <div className="board-toolbar">
          <div className="left">
            {FILTERS.map((f) => (
              <span key={f} className={'chip' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>{f}</span>
            ))}
          </div>
          <div className="left">
            {SORTS.map((s) => (
              <span key={s} className={'chip' + (sort === s ? ' on' : '')} onClick={() => setSort(s)}>{s}</span>
            ))}
            <div className="search-mini">
              <span>🔍</span><input placeholder="게시판 내 검색" />
            </div>
            <Link className="btn pop sm" to="/board/write">✏ 글쓰기</Link>
          </div>
        </div>

        {/* 테이블 */}
        <div className="board-table">
          <div className="thead">
            <span>분류</span><span>제목</span><span>작성자</span><span>작성</span><span>댓글</span><span>조회</span>
          </div>
          {posts.map((p) => (
            <Link key={p.id} className="board-row" to="/board">
              <span className={'b-tag ' + tagClass(p.tag)}>{p.tag}</span>
              <span className="b-title">
                {p.title}
                {p.cm > 0 && <span className="cmt">[{p.cm}]</span>}
                {p.isNew && <span className="new">N</span>}
              </span>
              <span className="b-meta">{p.author}</span>
              <span className="b-meta">{p.time}</span>
              <span className="b-num">{p.cm}</span>
              <span className="b-num">{p.views}</span>
            </Link>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="pagination">
          <span className="pg ghost">←</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={'pg' + (n === 1 ? ' on' : '')}>{n}</span>
          ))}
          <span className="pg ghost">→</span>
        </div>
      </div>
    </div>
  );
}
