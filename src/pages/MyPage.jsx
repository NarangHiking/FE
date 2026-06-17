import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, apiFetch } from '../context/AuthContext.jsx';

const TABS = ['저장한 산', '내가 쓴 글'];

export default function MyPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [tab, setTab] = useState('저장한 산');

  // ── 저장한 코스 상태 ──────────────────────────────────────
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(true);
  const [favError, setFavError]   = useState('');

  // ── 내가 쓴 글 상태 ───────────────────────────────────────
  const [myPosts, setMyPosts]     = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError]     = useState('');

  // ── 비로그인 → /login 리다이렉트 ─────────────────────────
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // ── 저장한 코스: GET /api/favorite/track ─────────────────
  useEffect(() => {
    if (!user) return;
    apiFetch('/api/favorite/track')
      .then((res) => {
        if (!res.ok) throw new Error('즐겨찾기를 불러오지 못했습니다.');
        return res.json();
      })
      .then((json) => setFavorites(json.data ?? json))
      .catch((err) => setFavError(err.message))
      .finally(() => setFavLoading(false));
  }, [user]);

  // ── 내가 쓴 글: GET /api/board → 내 이름으로 클라이언트 필터 ──
  // TODO(BE): userId 필터 파라미터 추가되면 서버사이드 필터로 교체
  useEffect(() => {
    if (!user) return;
    apiFetch('/api/board')
      .then((res) => {
        if (!res.ok) throw new Error('게시글을 불러오지 못했습니다.');
        return res.json();
      })
      .then((json) => {
        const all = json.data ?? json;
        setMyPosts(all.filter((p) => p.name === user.name));
      })
      .catch((err) => setPostsError(err.message))
      .finally(() => setPostsLoading(false));
  }, [user]);

  if (!user) return null; // 리다이렉트 중

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span><span className="here">마이페이지</span>
      </div>

      {/* ── 프로필 카드 ── */}
      <div className="profile-card">
        <div className="avatar">⛰</div>
        <div className="pinfo">
          <div className="pname">{user.name}</div>
          <div className="pmail">{user.email}</div>
          <div className="pbadges">
            <span className="tag green">🥾 {user.role ?? '일반 회원'}</span>
          </div>
        </div>
        <div className="pstats">
          <div className="ps"><div className="pv">{favorites.length}</div><div className="pk">저장 코스</div></div>
          <div className="ps"><div className="pv">{myPosts.length}</div><div className="pk">작성글</div></div>
        </div>
      </div>

      {/* ── 탭 ── */}
      <div className="tab-bar">
        {TABS.map((t) => (
          <button key={t} className={'tab' + (tab === t ? ' on' : '')} onClick={() => setTab(t)}>{t}</button>
        ))}
        <span style={{ flex: 1 }} />
        <Link className="btn sm ghost" to="/mypage/edit">⚙ 프로필 설정</Link>
      </div>

      {/* ── 저장한 산 ── */}
      {tab === '저장한 산' && (
        <div style={{ marginBottom: 40 }}>
          {favLoading && <p style={{ padding: 40, textAlign: 'center' }}>불러오는 중…</p>}
          {favError   && <p style={{ padding: 40, textAlign: 'center', color: 'var(--pop)' }}>{favError}</p>}
          {!favLoading && !favError && favorites.length === 0 && (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
              저장한 코스가 없습니다. <Link to="/mountains">산 목록</Link>에서 ♥ 저장해보세요.
            </p>
          )}
          {!favLoading && !favError && favorites.length > 0 && (
            <div className="board-table">
              <div className="thead" style={{ gridTemplateColumns: '1fr 120px 80px' }}>
                <span>코스명</span><span>산</span><span>추천수</span>
              </div>
              {favorites.map((f) => (
                <Link
                  key={f.id}
                  className="board-row"
                  to={`/mountains/${f.mountainId}`}
                  style={{ gridTemplateColumns: '1fr 120px 80px' }}
                >
                  <span className="b-title">{f.name}</span>
                  <span className="b-meta">{f.mountainId}</span>
                  <span className="b-num">{f.recommendCnt ?? 0}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 내가 쓴 글 ── */}
      {tab === '내가 쓴 글' && (
        <div style={{ marginBottom: 40 }}>
          {postsLoading && <p style={{ padding: 40, textAlign: 'center' }}>불러오는 중…</p>}
          {postsError   && <p style={{ padding: 40, textAlign: 'center', color: 'var(--pop)' }}>{postsError}</p>}
          {!postsLoading && !postsError && myPosts.length === 0 && (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
              작성한 글이 없습니다. <Link to="/board">게시판</Link>에서 글을 써보세요.
            </p>
          )}
          {!postsLoading && !postsError && myPosts.length > 0 && (
            <div className="board-table">
              <div className="thead">
                <span>작성자</span><span>제목</span><span>작성</span><span>댓글</span>
              </div>
              {myPosts.map((p) => (
                <Link key={p.id} className="board-row" to={`/board/${p.id}`}>
                  <span className="b-meta">{p.name}</span>
                  <span className="b-title">
                    {p.title}
                    {p.commentCount > 0 && <span className="cmt">[{p.commentCount}]</span>}
                  </span>
                  <span className="b-meta">{p.createdAt}</span>
                  <span className="b-num">{p.commentCount}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
