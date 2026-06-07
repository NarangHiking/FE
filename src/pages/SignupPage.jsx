import { Link, useNavigate } from 'react-router-dom';
import MountainScene from '../components/MountainScene.jsx';
import { Field, TextInput, Select } from '../components/Form.jsx';
import { REGIONS } from '../data/mountains.js';

const REGION_OPTIONS = ['선택 안 함', ...REGIONS.map((r) => r.name)];

export default function SignupPage() {
  const navigate = useNavigate();
  const onSubmit = (e) => {
    e.preventDefault();
    // TODO(BE): 회원가입 — POST /user { email, pass, name }
    //   1) 입력값 수집(email, name=닉네임, pass) + 비밀번호 확인 일치 검증
    //   2) 필수 약관 동의 체크 검증
    //   3) 성공 시 로그인 페이지로 이동(혹은 자동 로그인), 실패(중복 이메일 등) 시 에러 표시
    navigate('/login'); // 디자인 전용 (연동 시 교체)
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
              <TextInput type="email" placeholder="you@example.com" autoComplete="email" />
            </Field>
            <Field label="닉네임" required hint="2~12자, 한글/영문/숫자">
              <TextInput placeholder="등산러" />
            </Field>
            <Field label="비밀번호" required hint="8자 이상, 영문+숫자 조합">
              <TextInput type="password" placeholder="••••••••" autoComplete="new-password" />
            </Field>
            <Field label="비밀번호 확인" required>
              <TextInput type="password" placeholder="••••••••" autoComplete="new-password" />
            </Field>
            <Field label="주로 가는 지역" hint="맞춤 추천에 사용 (선택)">
              <Select value={REGION_OPTIONS[0]} options={REGION_OPTIONS} />
            </Field>

            {/* 약관 동의 */}
            <div className="terms">
              <label className="check all"><input type="checkbox" /> 전체 동의합니다</label>
              <label className="check row"><span><input type="checkbox" /> <span className="req">[필수]</span> 이용약관 동의</span></label>
              <label className="check row"><span><input type="checkbox" /> <span className="req">[필수]</span> 개인정보 수집·이용 동의</span></label>
              <label className="check row"><span><input type="checkbox" /> [선택] 마케팅 정보 수신 동의</span></label>
            </div>

            <button type="submit" className="btn pop block">가입하고 시작하기</button>
          </form>

          <div className="auth-foot">
            이미 계정이 있으신가요? <Link to="/login">로그인 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
