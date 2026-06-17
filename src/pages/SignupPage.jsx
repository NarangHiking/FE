import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import { Field, TextInput, Select } from '../components/Form.jsx';
import { REGIONS } from '../data/mountains.js';

const REGION_OPTIONS = ['선택 안 함', ...REGIONS.map((r) => r.name)];
const BASE = import.meta.env.VITE_API_URL ?? '';

export default function SignupPage() {
  const navigate = useNavigate();

  // 폼 필드 state
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [pass, setPass]         = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [termsAll, setTermsAll] = useState(false);
  const [term1, setTerm1]       = useState(false); // 이용약관
  const [term2, setTerm2]       = useState(false); // 개인정보

  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // 전체 동의 토글
  const toggleAll = (checked) => {
    setTermsAll(checked);
    setTerm1(checked);
    setTerm2(checked);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── 클라이언트 유효성 검사 ──────────────────────────────
    if (name.length < 2 || name.length > 12) {
      setError('닉네임은 2~12자로 입력해 주세요.'); return;
    }
    if (pass.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.'); return;
    }
    if (!/[a-zA-Z]/.test(pass) || !/[0-9]/.test(pass)) {
      setError('비밀번호는 영문과 숫자를 모두 포함해야 합니다.'); return;
    }
    if (pass !== passConfirm) {
      setError('비밀번호가 일치하지 않습니다.'); return;
    }
    if (!term1 || !term2) {
      setError('필수 약관에 동의해 주세요.'); return;
    }

    setLoading(true);
    try {
      // POST /api/user { email, pass, name }
      const res = await fetch(`${BASE}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pass, name }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? '회원가입에 실패했습니다.');
      }

      // 성공 → 로그인 페이지로
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
        <MountainScene variant={12} palette="dawn" w={760} h={1000} />
        <div className="ht" />
        <div className="veil" />
        <div className="art-body">
          <Link className="a-brand" to="/">
            <span className="seal">⛰</span>
            <span><b>나랑등산이다</b><span className="lat">NARANG · TRAIL CLUB</span></span>
          </Link>
          <div>
            <div className="tagline">오늘부터<br />함께 걸어요<span className="o">.</span></div>
            <p className="quote">전국 369개 산, 1,284개 코스. 가입하면 코스를 저장하고 후기를 남길 수 있어요.</p>
          </div>
          <span className="stamp-mini">· 입산 허가 NO.0426 ·</span>
        </div>
      </div>

      {/* 우측 폼 */}
      <div className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">SIGN UP</div>
          <h1>회원가입</h1>
          <p className="auth-sub">간단한 정보만 입력하면 바로 시작할 수 있어요.</p>

          <form className="auth-form" onSubmit={onSubmit}>
            <Field label="이메일" required>
              <TextInput
                type="email" placeholder="you@example.com" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="닉네임" required hint="2~12자, 한글/영문/숫자">
              <TextInput
                placeholder="등산러"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="비밀번호" required hint="8자 이상, 영문+숫자 조합">
              <TextInput
                type="password" placeholder="••••••••" autoComplete="new-password"
                value={pass} onChange={(e) => setPass(e.target.value)}
              />
            </Field>
            <Field label="비밀번호 확인" required>
              <TextInput
                type="password" placeholder="••••••••" autoComplete="new-password"
                value={passConfirm} onChange={(e) => setPassConfirm(e.target.value)}
              />
            </Field>
            <Field label="주로 가는 지역" hint="맞춤 추천에 사용 (선택)">
              <Select value={REGION_OPTIONS[0]} options={REGION_OPTIONS} />
            </Field>

            {/* 약관 동의 */}
            <div className="terms">
              <label className="check all">
                <input type="checkbox" checked={termsAll}
                  onChange={(e) => toggleAll(e.target.checked)} />
                전체 동의합니다
              </label>
              <label className="check row">
                <span>
                  <input type="checkbox" checked={term1}
                    onChange={(e) => setTerm1(e.target.checked)} />
                  <span className="req">[필수]</span> 이용약관 동의
                </span>
              </label>
              <label className="check row">
                <span>
                  <input type="checkbox" checked={term2}
                    onChange={(e) => setTerm2(e.target.checked)} />
                  <span className="req">[필수]</span> 개인정보 수집·이용 동의
                </span>
              </label>
              <label className="check row">
                <span><input type="checkbox" /> [선택] 마케팅 정보 수신 동의</span>
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn pop block" disabled={loading}>
              {loading ? '처리 중…' : '가입하고 시작하기'}
            </button>
          </form>

          <div className="auth-foot">
            이미 계정이 있으신가요? <Link to="/login">로그인 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
