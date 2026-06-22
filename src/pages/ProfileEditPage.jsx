import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, apiFetch } from '../context/AuthContext.jsx';
import { Field } from '../components/Form.jsx';

// 프로필 설정: 닉네임/비밀번호 변경 → PATCH /api/user
export default function ProfileEditPage() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [currentPass, setCurrentPass] = useState(''); // 현재 비밀번호 (필수)
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 비로그인 → 로그인으로
  useEffect(() => { if (!user) navigate('/login', { replace: true }); }, [user, navigate]);
  // 유저 로드되면 닉네임 prefill
  useEffect(() => { if (user) setName(user.name ?? ''); }, [user]);

  if (!user) return null;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('닉네임을 입력하세요.');
    if (!currentPass) return setError('현재 비밀번호를 입력하세요.');
    if (pass && pass !== pass2) return setError('새 비밀번호가 일치하지 않습니다.');

    setSubmitting(true);
    try {
      // PATCH /api/user { currentPass, pass, name } — userId 는 토큰 기반(안 보냄)
      const body = { currentPass, name };
      if (pass) body.pass = pass; // 새 비밀번호 미입력 시 안 보냄 (BE가 동적 SQL로 pass 컬럼 미수정)

      const res = await apiFetch('/api/user', { method: 'PATCH', body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? err.message ?? '수정에 실패했습니다.');
      }
      await refresh?.();  // 헤더/마이페이지 즉시 반영
      navigate('/mypage');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span>
        <Link to="/mypage">마이페이지</Link><span className="sep">/</span>
        <span className="here">프로필 설정</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">PROFILE SETTINGS</div>
        <h1>프로필 설정</h1>
      </div>

      <form className="form-layout solo" onSubmit={onSubmit}>
        <div className="form-card">
          <div className="fc-head"><h2>내 정보 수정</h2></div>
          <div className="fc-body">
            <div className="form-grid">
              <Field label="이메일" full hint="이메일은 변경할 수 없어요">
                <input className="inp" value={user.email ?? ''} disabled />
              </Field>
              <Field label="닉네임" required full>
                <input className="inp" value={name} maxLength={12} onChange={(e) => setName(e.target.value)} placeholder="닉네임" />
              </Field>
              <Field label="현재 비밀번호" required full hint="본인 확인을 위해 필요해요">
                <input className="inp" type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
              </Field>
              <Field label="새 비밀번호" hint="변경할 때만 입력 (8자 이상)">
                <input className="inp" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </Field>
              <Field label="새 비밀번호 확인">
                <input className="inp" type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
              </Field>
            </div>
          </div>
          {error && <p style={{ color: 'var(--pop)', padding: '0 22px 12px' }}>{error}</p>}
          <div className="form-actions">
            <Link className="btn ghost" to="/mypage">취소</Link>
            <button type="submit" className="btn pop" disabled={submitting}>
              {submitting ? '저장 중…' : '변경 저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
