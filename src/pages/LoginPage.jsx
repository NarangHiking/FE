import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import { Field, TextInput } from '../components/Form.jsx';
import { useAuth } from '../context/AuthContext.jsx'; // ← Context 훅

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Context 에서 login 함수 꺼내기

  // controlled input: 값이 바뀔 때마다 state 를 갱신해 React 가 추적하게 한다
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [error, setError]     = useState('');   // 에러 메시지
  const [loading, setLoading] = useState(false); // 중복 제출 방지

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, pass);  // POST /api/auth/login
      navigate('/');             // 성공 → 홈으로
    } catch (err) {
      setError(err.message);     // 실패 → 에러 메시지 표시
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      {/* 좌측 산 풍경 */}
      <div className="auth-art">
        <MountainScene variant={7} palette="forest" w={760} h={1000} />
        <div className="ht" />
        <div className="veil" />
        <div className="art-body">
          <Link className="a-brand" to="/">
            <span className="seal">⛰</span>
            <span><b>나랑등산이다</b><span className="lat">NARANG · TRAIL CLUB</span></span>
          </Link>
          <div>
            <div className="tagline">다시,<br />능선 위로<span className="o">.</span></div>
            <p className="quote">"산은 거기 있으니까 오른다." — 저장해 둔 코스와 GPX가 당신을 기다리고 있어요.</p>
          </div>
          <span className="stamp-mini">· 입산 환영 · since 2026 ·</span>
        </div>
      </div>

      {/* 우측 폼 */}
      <div className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">LOG IN</div>
          <h1>로그인</h1>
          <p className="auth-sub">계정으로 로그인하고 코스를 저장하세요.</p>

          <form className="auth-form" onSubmit={onSubmit}>
            <Field label="이메일" required>
              {/* value + onChange 로 controlled input 완성 */}
              <TextInput
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="비밀번호" required>
              <TextInput
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </Field>

            {/* 에러 메시지: error 가 있을 때만 렌더링 */}
            {error && <p className="form-error">{error}</p>}

            <div className="auth-row">
              <label className="check"><input type="checkbox" defaultChecked /> 로그인 상태 유지</label>
              <Link to="/reset-password">비밀번호를 잊으셨나요?</Link>
            </div>

            {/* disabled + 텍스트 변경으로 중복 제출 방지 */}
            <button type="submit" className="btn pop block" disabled={loading}>
              {loading ? '로그인 중…' : '로그인'}
            </button>
          </form>

          <div className="auth-foot">
            아직 회원이 아니신가요? <Link to="/signup">회원가입 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
