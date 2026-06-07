import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Field, TextInput, Textarea, Select, Segmented, Dropzone } from '../components/Form.jsx';

// 자유게시판 / 건의게시판 공용 글쓰기 폼.
// /board/write → 자유게시판, /suggestions/write → 건의게시판
const CONFIG = {
  board: {
    eyebrow: 'WRITE · 자유게시판',
    title: '글쓰기',
    back: '/board',
    backLabel: '자유게시판',
    catLabel: '분류',
    cats: ['후기', '질문', '자유', '정보'],
    placeholder: '제목을 입력하세요 (예: 북한산 백운대 다녀온 후기)',
    bodyPlaceholder: '본문을 작성하세요. 코스, 날씨, 장비, 사진 설명 등을 자유롭게 남겨주세요.',
    tips: ['후기는 코스명·날짜·난이도를 함께 적어주면 좋아요.', '욕설/광고/도배 글은 통보 없이 삭제될 수 있어요.', '사진은 최대 10장까지 첨부할 수 있어요.'],
  },
  suggestions: {
    eyebrow: 'WRITE · 건의게시판',
    title: '건의하기',
    back: '/suggestions',
    backLabel: '건의게시판',
    catLabel: '유형',
    cats: ['산 추가', '경로 수정', '기능 제안', '오류 신고'],
    placeholder: '건의 제목을 입력하세요 (예: 가평 운악산 코스 등록 요청)',
    bodyPlaceholder: '어떤 산/경로가 빠졌는지, 무엇을 개선하면 좋을지 구체적으로 적어주세요.',
    tips: ['산 추가 요청 시 지역과 들머리(출발지)를 적어주세요.', '오류 신고는 어떤 페이지인지 함께 알려주세요.', '관리자 검토 후 상태가 업데이트됩니다.'],
  },
};

export default function PostWritePage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const kind = pathname.startsWith('/suggestions') ? 'suggestions' : 'board';
  const c = CONFIG[kind];

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO(BE): 게시글 작성 — POST /api/board (multipart/form-data)
    //   본문 필드: { userId(로그인유저), trackId(선택), title, content, category }
    //   + 첨부 이미지 파일들. category 는 kind 에 따라 FREE / SUGGEST 등으로 매핑.
    //   성공 시 생성된 글 상세 또는 목록(c.back)으로 이동.
    //   (수정 화면이면 PUT /api/board/{id} 사용)
    // 디자인 전용: 저장 없이 목록으로 돌아간다.
    navigate(c.back);
  };

  return (
    <div className="wrap">
      <div className="crumb">
        <Link to="/">홈</Link><span className="sep">/</span>
        <Link to={c.back}>{c.backLabel}</Link><span className="sep">/</span>
        <span className="here">{c.title}</span>
      </div>

      <div className="page-head">
        <div className="eyebrow">{c.eyebrow}</div>
        <h1>{c.title}</h1>
      </div>

      <form className="form-layout" onSubmit={onSubmit}>
        <div className="form-card">
          <div className="fc-head">
            <h2>{c.title}</h2>
            <span className="mono">DRAFT · 자동 저장 안 됨</span>
          </div>
          <div className="fc-body">
            <div className="form-grid">
              <Field label={c.catLabel} required>
                <Select value={c.cats[0]} options={c.cats} />
              </Field>
              <Field label="공개 범위">
                <Select value="전체 공개" options={['전체 공개', '회원만', '나만 보기']} />
              </Field>

              <Field label="제목" required full>
                <TextInput placeholder={c.placeholder} maxLength={80} />
              </Field>

              <Field label="내용" required full hint="마크다운 일부 지원 · 최대 10,000자">
                <Textarea tall placeholder={c.bodyPlaceholder} />
              </Field>

              <Field label="사진 첨부" full hint="JPG / PNG / GIF · 장당 10MB 이하">
                <Dropzone icon="🏞" title="사진을 끌어다 놓거나 클릭하여 업로드" sub="최대 10장" />
              </Field>

              <Field label="태그" full hint="쉼표로 구분 (예: 북한산, 단풍, 당일치기)">
                <TextInput placeholder="태그를 입력하세요" />
              </Field>
            </div>
          </div>
          <div className="form-actions">
            <Link className="btn ghost" to={c.back}>취소</Link>
            <button type="button" className="btn">임시 저장</button>
            <button type="submit" className="btn pop">등록하기</button>
          </div>
        </div>

        <aside className="tips-card">
          <h4>✍ 작성 팁</h4>
          <ul>
            {c.tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </aside>
      </form>
    </div>
  );
}
