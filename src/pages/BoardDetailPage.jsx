import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../context/AuthContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function BoardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── 게시글 상태 ───────────────────────────────────────────
  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // ── 댓글 입력 상태 ────────────────────────────────────────
  const [commentText, setCommentText]   = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // ── 게시글 조회: GET /api/board/{id} ────────────────────
  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/board/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('게시글을 불러오지 못했습니다.');
        return res.json();
      })
      .then((json) => setPost(json.data ?? json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // ── 게시글 삭제: DELETE /api/board/{id} ─────────────────
  async function handleDelete() {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const res = await apiFetch(`/api/board/${id}`, { method: 'DELETE' });
    if (res.ok) {
      navigate('/board');
    } else {
      alert('삭제에 실패했습니다.');
    }
  }

  // ── 댓글 작성: POST /api/board/{id}/comment ─────────────
  // BE: BoardCommentRequest { content: string }
  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const res = await apiFetch(`/api/board/${id}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText }),
      });
      if (!res.ok) throw new Error('댓글 작성 실패');
      // 댓글 작성 후 게시글 재조회 (댓글 목록 갱신)
      const updated = await apiFetch(`/api/board/${id}`).then((r) => r.json());
      setPost(updated.data ?? updated);
      setCommentText('');
    } catch {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setCommentLoading(false);
    }
  }

  // ── 댓글 삭제: DELETE /api/board/{id}/comment/{commentId} ──
  async function handleCommentDelete(commentId) {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    const res = await apiFetch(`/api/board/${id}/comment/${commentId}`, { method: 'DELETE' });
    if (res.ok) {
      // 삭제 후 목록 갱신
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments ?? []).filter((c) => c.id !== commentId),
      }));
    } else {
      alert('댓글 삭제에 실패했습니다.');
    }
  }

  // ── 로딩/에러 상태 ────────────────────────────────────────
  if (loading) return <div className="wrap" style={{ padding: 60, textAlign: 'center' }}>불러오는 중…</div>;
  if (error)   return <div className="wrap" style={{ padding: 60, textAlign: 'center', color: 'var(--pop)' }}>{error}</div>;
  if (!post)   return null;

  const isAuthor = user && user.name === post.name; // 작성자 본인 여부
  const backPath = post.category === 'feedback' ? '/suggestions' : '/board';
  const comments = post.comments ?? [];

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span>
        <Link to={backPath}>{post.category === 'feedback' ? '건의게시판' : '자유게시판'}</Link>
        <span className="sep">/</span>
        <span className="here">게시글</span>
      </div>

      {/* ── 게시글 본문 ── */}
      <div className="post-card">
        <div className="post-header">
          <div className="post-meta-row">
            <span className="tag green">{post.category === 'feedback' ? '건의' : '자유'}</span>
            <span className="post-author">{post.name}</span>
            <span className="post-date">{post.createdAt}</span>
          </div>
          <h1 className="post-title">{post.title}</h1>
        </div>

        {/* 첨부 이미지 */}
        {post.image && (
          <div className="post-image">
            <img src={post.image} alt="첨부 이미지" style={{ maxWidth: '100%', borderRadius: 8 }} />
          </div>
        )}

        {/* 본문 */}
        <div className="post-body">
          {post.content ?? '(내용 없음)'}
        </div>

        {/* 작성자만 수정/삭제 버튼 노출 */}
        {isAuthor && (
          <div className="post-actions">
            <Link className="btn sm" to={`/board/${id}/edit`}>✏ 수정</Link>
            <button className="btn sm danger" onClick={handleDelete}>🗑 삭제</button>
          </div>
        )}
      </div>

      {/* ── 댓글 섹션 ── */}
      <div className="comment-section">
        <h3 className="comment-heading">댓글 {comments.length}개</h3>

        {/* 댓글 목록 */}
        {comments.length === 0
          ? <p style={{ color: 'var(--ink-soft)', padding: '12px 0' }}>첫 댓글을 남겨보세요.</p>
          : comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-top">
                <span className="comment-author">{c.name}</span>
                <span className="comment-date">{c.createdAt}</span>
                {/* 내 댓글만 삭제 버튼 */}
                {user && user.name === c.name && (
                  <button className="comment-delete" onClick={() => handleCommentDelete(c.id)}>삭제</button>
                )}
              </div>
              <div className="comment-body">{c.content}</div>
            </div>
          ))
        }

        {/* 댓글 작성 — 로그인 시에만 */}
        {user
          ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              placeholder="댓글을 입력하세요"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />
            <button className="btn pop sm" type="submit" disabled={commentLoading}>
              {commentLoading ? '등록 중…' : '댓글 등록'}
            </button>
          </form>
          )
          : <p style={{ color: 'var(--ink-soft)', marginTop: 12 }}>댓글을 작성하려면 <Link to="/login">로그인</Link>이 필요합니다.</p>
        }
      </div>
    </div>
  );
}
