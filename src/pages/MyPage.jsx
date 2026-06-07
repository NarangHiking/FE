import { useState } from 'react';
import { Link } from 'react-router-dom';
import MountainCard from '../components/MountainCard.jsx';
import { MOUNTAINS } from '../data/mountains.js';
import { FREE_POSTS } from '../data/posts.js';

const TABS = ['저장한 산', '내가 쓴 글'];

export default function MyPage() {
  const [tab, setTab] = useState('저장한 산');
  // TODO(BE): 내 정보 — GET /api/user (프로필: email, name, role, createdAt). 비로그인 시 /login 리다이렉트.
  // TODO(BE): 저장한 산/코스 — GET /api/favorite/track 로 saved 더미 교체.
  // TODO(BE): 내가 쓴 글 — GET /api/board (작성자=내 userId 필터; BE에 userId 필터 없으면 추가 요청).
  // TODO(BE): 누른 좋아요 — GET /api/recommend/track. 프로필 수정 → PATCH /api/user { userId, pass, name }, 탈퇴 → PATCH /api/user/remove.
  const saved = MOUNTAINS.slice(0, 4);
  const myPosts = FREE_POSTS.slice(0, 5);

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span><span className="here">마이페이지</span>
      </div>

      {/* 프로필 카드 */}
      <div className="profile-card">
        <div className="avatar">⛰</div>
        <div className="pinfo">
          <div className="pname">산소년</div>
          <div className="pmail">mountain.boy@example.com</div>
          <div className="pbadges">
            <span className="tag green">🥾 등산 레벨 7</span>
            <span className="tag">가입 152일째</span>
            <span className="tag pop">단풍 헌터</span>
          </div>
        </div>
        <div className="pstats">
          <div className="ps"><div className="pv">31</div><div className="pk">저장 코스</div></div>
          <div className="ps"><div className="pv">23</div><div className="pk">작성글</div></div>
          <div className="ps"><div className="pv">48</div><div className="pk">누른 좋아요</div></div>
        </div>
      </div>

      {/* 탭 */}
      <div className="tab-bar">
        {TABS.map((t) => (
          <button key={t} className={'tab' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>
        ))}
        <span style={{ flex: 1 }} />
        <Link className="btn sm ghost" to="/mypage">⚙ 프로필 설정</Link>
      </div>

      {/* 저장한 산 */}
      {tab === '저장한 산' && (
        <div className="grid" style={{ marginBottom: 40 }}>
          {saved.map((m, i) => (
            <MountainCard key={m.id} m={m} sceneVariant={i + 61} showRank={false} />
          ))}
        </div>
      )}

      {/* 내가 쓴 글 */}
      {tab === '내가 쓴 글' && (
        <div className="board-table" style={{ marginBottom: 40 }}>
          <div className="thead">
            <span>분류</span><span>제목</span><span>작성자</span><span>작성</span><span>댓글</span><span>조회</span>
          </div>
          {myPosts.map((p) => (
            <Link key={p.id} className="board-row" to="/board">
              <span className={'b-tag ' + (p.tag === '후기' ? 'review' : p.tag === '질문' ? 'q' : p.tag === '정보' ? 'info' : '')}>{p.tag}</span>
              <span className="b-title">{p.title}{p.cm > 0 && <span className="cmt">[{p.cm}]</span>}</span>
              <span className="b-meta">나</span>
              <span className="b-meta">{p.time}</span>
              <span className="b-num">{p.cm}</span>
              <span className="b-num">{p.views}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
