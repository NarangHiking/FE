import { Link } from 'react-router-dom';
import MountainScene from './MountainScene.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  return (
    <footer>
      <div className="foot-band">
        <MountainScene variant={3} palette="mist" w={1240} h={70} />
      </div>
      <div className="wrap foot-in">
        <div className="cols">
          <div className="foot-col">
            <h4>둘러보기</h4>
            <Link to="/mountains">산 목록</Link>
            <Link to="/board">커뮤니티</Link>
            <Link to="/mypage">마이페이지</Link>
          </div>
          <div className="foot-col">
            <h4>계정</h4>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
            {isAdmin && <Link to="/admin">관리자 콘솔</Link>}
          </div>
          <div className="foot-col">
            <h4>정보</h4>
            <Link to="/gpx">GPX 사용법</Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div className="brand">
            <span className="seal">⛰</span>
            <span><b>나랑등산이다</b><span className="lat">NARANG · TRAIL CLUB</span></span>
          </div>
          <p className="foot-note">
            실제 산이 아닐 수 있습니다. 입산 전 날씨와 통제 구간을 꼭 확인하세요. 모든 GPX는 참고용입니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
