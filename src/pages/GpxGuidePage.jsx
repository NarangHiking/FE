import { useState } from 'react';
import { Link } from 'react-router-dom';

const DOWNLOAD_STEPS = [
  { t: '산 상세 페이지 열기', d: '산 목록이나 검색에서 원하는 산을 선택해 상세 페이지로 이동합니다.' },
  { t: '코스(경로) 선택', d: '상세 페이지의 코스 탭에서 걸을 경로를 고르면 지도와 고도 그래프가 함께 바뀝니다.' },
  { t: 'GPX 다운로드', d: '우측 사이드바의 “GPX 다운로드” 카드에서 [받기] 버튼을 누릅니다.' },
  { t: '.gpx 파일 저장', d: '`산이름_코스명.gpx` 파일이 내려받아집니다. 이 파일을 기기/앱으로 옮기면 됩니다.' },
];

const DEVICES = {
  '스마트폰 앱': {
    apps: ['트랭글', '램블러', 'OsmAnd', 'Komoot'],
    steps: [
      '앱스토어에서 등산 내비 앱(트랭글·램블러 등)을 설치합니다.',
      '앱의 “가져오기 / 파일 열기”에서 받은 .gpx 파일을 선택합니다.',
      '경로가 지도에 표시되면 [내비게이션 시작]을 눌러 따라 걷습니다.',
      '데이터가 약한 산에서는 미리 오프라인 지도를 받아두세요.',
    ],
  },
  'GPS 워치·기기': {
    apps: ['Garmin', 'SUUNTO', 'Coros'],
    steps: [
      'USB 케이블로 기기를 PC에 연결합니다.',
      '기기 저장소의 `GPX` 폴더(예: Garmin/NewFiles)에 .gpx 파일을 복사합니다.',
      '기기를 분리하고 “코스/경로 불러오기” 메뉴에서 선택합니다.',
      '워치 화면의 경로 안내를 따라 산행을 시작합니다.',
    ],
  },
};

const FAQ = [
  { q: 'GPX 파일이 안 열려요.', a: '확장자가 .gpx인지 확인하고, 등산 전용 앱(트랭글·램블러 등)으로 가져오기 하세요. 일반 갤러리/파일 앱에서는 열리지 않습니다.' },
  { q: '데이터가 안 터지는 산에서도 쓸 수 있나요?', a: '네. GPS는 통신과 별개로 동작합니다. 다만 배경 지도는 오프라인 지도를 미리 받아두어야 보입니다.' },
  { q: '경로가 실제와 조금 달라요.', a: '모든 GPX는 참고용입니다. 통제구간·우회로가 생길 수 있으니 현장 안내판과 날씨를 꼭 확인하세요. 오류는 건의게시판으로 알려주시면 검토합니다.' },
];

export default function GpxGuidePage() {
  const [device, setDevice] = useState('스마트폰 앱');
  const dv = DEVICES[device];

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span><span className="here">GPX 사용법</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">GPX GUIDE</div>
        <h1>GPX 사용법</h1>
        <p className="desc">코스를 내려받아 스마트폰·GPS 기기로 길을 따라 걷는 방법을 정리했어요.</p>
      </div>

      <div className="guide guide-grid">
        <div>
          {/* GPX란? */}
          <section className="guide-section" id="what">
            <div className="blk-head"><span className="num">01</span><h2>GPX란?</h2></div>
            <div className="guide-lead">
              <b>GPX(GPS Exchange Format)</b>는 위도·경도·고도 좌표를 시간 순서로 담은 표준 파일이에요.
              등산 코스의 실제 경로가 그대로 들어 있어서, 호환되는 앱이나 기기에 넣으면
              <b> 내가 지금 코스 어디쯤 있는지</b>, 갈림길에서 어디로 가야 하는지를 GPS로 안내받을 수 있습니다.
            </div>
          </section>

          {/* 다운로드 */}
          <section className="guide-section" id="download">
            <div className="blk-head"><span className="num">02</span><h2>코스 다운로드</h2><span className="sub">— 4단계</span></div>
            <div className="steps">
              {DOWNLOAD_STEPS.map((s, i) => (
                <div className="step" key={i}>
                  <div className="sn">{i + 1}</div>
                  <div className="stx"><h3>{s.t}</h3><p>{s.d}</p></div>
                </div>
              ))}
            </div>
          </section>

          {/* 기기에 불러오기 */}
          <section className="guide-section" id="import">
            <div className="blk-head"><span className="num">03</span><h2>기기에 불러오기</h2></div>
            <div className="tab-bar" style={{ margin: '0 0 14px' }}>
              {Object.keys(DEVICES).map((k) => (
                <button key={k} className={'tab' + (device === k ? ' on' : '')} onClick={() => setDevice(k)}>{k}</button>
              ))}
            </div>
            <div className="device-body">
              <div className="apps">
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)', alignSelf: 'center' }}>추천 앱/기기</span>
                {dv.apps.map((a) => <span key={a} className="chip">{a}</span>)}
              </div>
              <div className="steps">
                {dv.steps.map((s, i) => (
                  <div className="step" key={i}>
                    <div className="sn">{i + 1}</div>
                    <div className="stx"><p style={{ marginTop: 8, fontSize: 15 }}>{s}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 주의사항 */}
          <section className="guide-section" id="notice">
            <div className="blk-head"><span className="num">04</span><h2>안전 주의사항</h2></div>
            <div className="notice">
              <h3>입산 전 꼭 확인하세요</h3>
              <ul>
                <li>모든 GPX는 참고용입니다. 통제구간·우회로·산불 조심 기간을 반드시 확인하세요.</li>
                <li>휴대폰 배터리를 충분히 충전하고 보조배터리를 챙기세요. GPS는 배터리를 빨리 씁니다.</li>
                <li>데이터가 약한 산에서는 오프라인 지도를 미리 내려받아 두세요.</li>
                <li>일몰 시간과 날씨를 확인하고, 여유 있는 하산 시간을 계획하세요.</li>
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section className="guide-section" id="faq" style={{ marginBottom: 0 }}>
            <div className="blk-head"><span className="num">05</span><h2>자주 묻는 질문</h2></div>
            <div className="faq">
              {FAQ.map((f, i) => (
                <div className="qa" key={i}>
                  <div className="q">{f.q}</div>
                  <div className="a">{f.a}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 목차 */}
        <aside className="guide-toc">
          <h4>목차</h4>
          <a href="#what">01 · GPX란?</a>
          <a href="#download">02 · 코스 다운로드</a>
          <a href="#import">03 · 기기에 불러오기</a>
          <a href="#notice">04 · 안전 주의사항</a>
          <a href="#faq">05 · 자주 묻는 질문</a>
        </aside>
      </div>
    </div>
  );
}
