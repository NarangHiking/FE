import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SUGGESTIONS } from '../data/posts.js';

const TYPES = ['전체', '산 추가', '경로 수정', '기능 제안', '오류 신고'];
const STATUS = ['전체', '접수', '검토중', '등록완료', '반려'];

export default function SuggestionBoardPage() {
  const [type, setType] = useState('전체');
  const [status, setStatus] = useState('전체');
  // TODO(BE): 건의게시판 목록 — GET /board?category=SUGGEST (자유게시판과 category 로 구분).
  //   ⚠ 상태 배지(접수/검토중/등록완료/반려)는 현재 board 스키마에 없음
  //   → board 에 status 컬럼 추가하거나 별도 건의 도메인 신설 필요. type 필터는 category/태그로 매핑.

  let list = SUGGESTIONS;
  if (type !== '전체') list = list.filter((s) => s.type === type);
  if (status !== '전체') list = list.filter((s) => s.statusLabel === status);

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

      {/* 건의 CTA */}
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
          <div className="left">
            {TYPES.map((t) => (
              <span key={t} className={'chip' + (type === t ? ' on' : '')} onClick={() => setType(t)}>{t}</span>
            ))}
          </div>
          <div className="left">
            {STATUS.map((s) => (
              <span key={s} className={'chip' + (status === s ? ' on' : '')} onClick={() => setStatus(s)}>{s}</span>
            ))}
            <Link className="btn pop sm" to="/suggestions/write">✏ 건의하기</Link>
          </div>
        </div>

        <div className="board-table">
          <div className="thead">
            <span>유형</span><span>제목</span><span>상태</span><span>작성자</span><span>댓글</span><span>작성</span>
          </div>
          {list.map((s) => (
            <Link key={s.id} className="board-row" to="/suggestions">
              <span className="b-tag info">{s.type}</span>
              <span className="b-title">{s.title}</span>
              <span><span className={'st-badge ' + s.status}>{s.statusLabel}</span></span>
              <span className="b-meta">{s.author}</span>
              <span className="b-num">{s.cm}</span>
              <span className="b-num">{s.time}</span>
            </Link>
          ))}
        </div>

        <div className="pagination">
          <span className="pg ghost">←</span>
          {[1, 2, 3].map((n) => (
            <span key={n} className={'pg' + (n === 1 ? ' on' : '')}>{n}</span>
          ))}
          <span className="pg ghost">→</span>
        </div>
      </div>
    </div>
  );
}
