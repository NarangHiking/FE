import { Link, useNavigate } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import { Field, TextInput } from '../components/Form.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const onSubmit = (e) => {
    e.preventDefault();
    // TODO(BE): 로그인 — POST /api/auth/login { email, pass }
    //   → 응답 { accessToken, refreshToken, userId } 저장 후 AuthContext 갱신.
    //   1) 입력값(email, pass) controlled state 또는 ref 로 수집
    //   2) 성공 시 토큰 저장 + 이전 페이지/홈으로 이동, 실패 시 에러 메시지 표시
    navigate('/'); // 디자인 전용 (연동 시 교체)
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
              <TextInput type="email" placeholder="you@example.com" autoComplete="email" />
            </Field>
            <Field label="비밀번호" required>
              <TextInput type="password" placeholder="••••••••" autoComplete="current-password" />
            </Field>

            <div className="auth-row">
              <label className="check"><input type="checkbox" defaultChecked /> 로그인 상태 유지</label>
              <Link to="/login">비밀번호를 잊으셨나요?</Link>
            </div>

            <button type="submit" className="btn pop block">로그인</button>
          </form>

          {/* TODO(BE): 소셜 로그인 — 현재 BE에 OAuth 엔드포인트 없음.
              카카오/네이버/구글 OAuth 추가 시 각 버튼 onClick 연동. */}
          <div className="divider">또는 간편 로그인</div>
          <div className="social-row">
            <button className="social-btn kakao" type="button">💬 카카오</button>
            <button className="social-btn naver" type="button">N 네이버</button>
            <button className="social-btn google" type="button">G 구글</button>
          </div>

          <div className="auth-foot">
            아직 회원이 아니신가요? <Link to="/signup">회원가입 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
