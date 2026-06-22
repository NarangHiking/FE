import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, apiFetch } from '../context/AuthContext.jsx';

const TABS = ['저장한 코스', '내가 쓴 글'];
const PAGE_SIZE = 10;

function pageNums(page, totalPages) {
  const nums = []; const start = Math.max(1, page - 2); const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i); return nums;
}
function Pager({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination" style={{ margin: '18px 0 0' }}>
      <span className={'pg ghost' + (page === 1 ? ' disabled' : '')} onClick={() => page > 1 && onPage(page - 1)}>←</span>
      {pageNums(page, totalPages).map((n) => (
        <span key={n} className={'pg' + (n === page ? ' on' : '')} onClick={() => onPage(n)}>{n}</span>
      ))}
      <span className={'pg ghost' + (page === totalPages ? ' disabled' : '')} onClick={() => page < totalPages && onPage(page + 1)}>→</span>
    </div>
  );
}

export default function MyPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // 탭을 URL(?tab=)에 저장 → 글 보고 뒤로가기 해도 같은 탭 유지
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'posts' ? '내가 쓴 글' : '저장한 코스';
  const setTab = (t) => setSearchParams(t === '내가 쓴 글' ? { tab: 'posts' } : {}, { replace: true });

  // ── 저장한 코스 상태 ──────────────────────────────────────
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(true);
  const [favError, setFavError]   = useState('');
  const [favPage, setFavPage]     = useState(1);

  // ── 내가 쓴 글 상태 ───────────────────────────────────────
  const [myPosts, setMyPosts]     = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError]     = useState('');
  const [postPage, setPostPage]   = useState(1);

  // ── 비로그인 → /login 리다이렉트 ─────────────────────────
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
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

  // 페이지 슬라이스 (데이터 감소 시 현재 페이지 보정)
  const favTotal = Math.max(1, Math.ceil(favorites.length / PAGE_SIZE));
  const favCur   = Math.min(favPage, favTotal);
  const favItems = favorites.slice((favCur - 1) * PAGE_SIZE, favCur * PAGE_SIZE);
  const postTotal = Math.max(1, Math.ceil(myPosts.length / PAGE_SIZE));
  const postCur   = Math.min(postPage, postTotal);
  const postItems = myPosts.slice((postCur - 1) * PAGE_SIZE, postCur * PAGE_SIZE);

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

      {/* ── 저장한 코스 ── */}
      {tab === '저장한 코스' && (
        <div style={{ marginBottom: 40 }}>
          {favLoading && <p style={{ padding: 40, textAlign: 'center' }}>불러오는 중…</p>}
          {favError   && <p style={{ padding: 40, textAlign: 'center', color: 'var(--pop)' }}>{favError}</p>}
          {!favLoading && !favError && favorites.length === 0 && (
            <p style={{ padding: 40, textAlign: 'center', color: 'var(--ink-soft)' }}>
              저장한 코스가 없습니다. <Link to="/mountains">산 상세</Link>에서 코스를 저장해보세요.
            </p>
          )}
          {!favLoading && !favError && favorites.length > 0 && (
            <div className="board-table">
              <div className="thead" style={{ gridTemplateColumns: '1fr 120px 80px' }}>
                <span>코스명</span><span>산</span><span>추천수</span>
              </div>
              {favItems.map((f) => (
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
          <Pager page={favCur} totalPages={favTotal} onPage={setFavPage} />
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
              {postItems.map((p) => (
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
          <Pager page={postCur} totalPages={postTotal} onPage={setPostPage} />
        </div>
      )}
    </div>
  );
}
