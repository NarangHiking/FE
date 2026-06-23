import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import { Field, TextInput } from '../components/Form.jsx';
import { apiFetch } from '../context/AuthContext.jsx';

// 비밀번호 재설정 — 이메일 + 이름으로 본인 확인 후 새 비밀번호 설정.
// BE: PATCH /api/user/reset-password  body { email, name, pass }  (로그인 불필요)
export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [pass, setPass]         = useState('');
  const [pass2, setPass2]       = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 클라이언트 검증
    if (pass.length < 8) { setError('새 비밀번호는 8자 이상이어야 합니다.'); return; }
    if (pass !== pass2)  { setError('새 비밀번호가 일치하지 않습니다.'); return; }

    setLoading(true);
    try {
      const res = await apiFetch('/api/user/reset-password', {
        method: 'PATCH',
        body: JSON.stringify({ email, name, pass }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // BE: 404 → "해당 사용자가 존재하지 않습니다." 등
        throw new Error(err.error ?? err.message ?? '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.');
      }
      alert('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      {/* 좌측 산 풍경 */}
      <div className="auth-art">
        <MountainScene variant={4} palette="forest" w={760} h={1000} />
        <div className="ht" />
        <div className="veil" />
        <div className="art-body">
          <Link className="a-brand" to="/">
            <span className="seal">⛰</span>
            <span><b>나랑등산이다</b><span className="lat">NARANG · TRAIL CLUB</span></span>
          </Link>
          <div>
            <div className="tagline">다시,<br />길을 찾다<span className="o">.</span></div>
            <p className="quote">"잠깐 길을 잃어도 괜찮아요." — 이메일과 이름으로 본인 확인 후 새 비밀번호를 설정하세요.</p>
          </div>
          <span className="stamp-mini">· 입산 환영 · since 2026 ·</span>
        </div>
      </div>

      {/* 우측 폼 */}
      <div className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">RESET PASSWORD</div>
          <h1>비밀번호 재설정</h1>
          <p className="auth-sub">가입한 이메일과 이름을 입력하고 새 비밀번호를 설정하세요.</p>

          <form className="auth-form" onSubmit={onSubmit}>
            <Field label="이메일" required>
              <TextInput
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="이름" required>
              <TextInput
                type="text"
                placeholder="가입 시 등록한 이름"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="새 비밀번호" required>
              <TextInput
                type="password"
                placeholder="8자 이상"
                autoComplete="new-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </Field>
            <Field label="새 비밀번호 확인" required>
              <TextInput
                type="password"
                placeholder="다시 한 번 입력"
                autoComplete="new-password"
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
              />
            </Field>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn pop block" disabled={loading}>
              {loading ? '변경 중…' : '비밀번호 변경'}
            </button>
          </form>

          <div className="auth-foot">
            비밀번호가 기억나셨나요? <Link to="/login">로그인 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
