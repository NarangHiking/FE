// 디자인용 더미 게시글 데이터.
// TODO(BE): GET /api/board?category=&keyword= 응답으로 교체 (자유=FREE / 건의=SUGGEST 등 category 구분).
//   REVIEWS(별점 후기)와 SUGGESTIONS 상태배지는 BE 스키마에 없음 → 도메인 추가 협의.

// 자유게시판
export const FREE_POSTS = [
  { id: 1, tag: '후기', title: '북한산 백운대 다녀왔어요! 단풍이 미쳤음', author: '산소년', cm: 12, time: '10분', views: 84, isNew: true },
  { id: 2, tag: '질문', title: '초보가 가기 좋은 서울 근교 코스 추천 부탁드려요', author: '뉴비등산', cm: 24, time: '1시간', views: 152, isNew: true },
  { id: 3, tag: '자유', title: '관악산 일출 인증 ☀️ (사진은 댓글에)', author: '새벽러', cm: 7, time: '3시간', views: 63 },
  { id: 4, tag: '정보', title: 'GPX 파일 어떻게 쓰는지 처음부터 정리해봤습니다', author: 'gpx마스터', cm: 31, time: '어제', views: 401 },
  { id: 5, tag: '후기', title: '지리산 종주 3박4일 후기 — 장비 리스트 공유', author: '백패커J', cm: 45, time: '어제', views: 588 },
  { id: 6, tag: '질문', title: '겨울 산행 아이젠 추천 좀 해주세요', author: '겨울곰', cm: 18, time: '2일 전', views: 210 },
  { id: 7, tag: '자유', title: '오늘 도봉산 날씨 실화냐... 미세먼지 0', author: '맑음이', cm: 9, time: '2일 전', views: 97 },
  { id: 8, tag: '정보', title: '수도권 무료 주차 가능한 산 입구 모음', author: '뚜벅이탈출', cm: 27, time: '3일 전', views: 332 },
  { id: 9, tag: '후기', title: '한라산 백록담 드디어 봤습니다 (예약 꿀팁)', author: '제주댁', cm: 52, time: '3일 전', views: 720 },
  { id: 10, tag: '질문', title: '등산화 vs 트레킹화 차이가 뭔가요?', author: '신발고민', cm: 14, time: '4일 전', views: 188 },
  { id: 11, tag: '자유', title: '산에서 먹는 컵라면이 세상에서 제일 맛있다', author: '라면사랑', cm: 33, time: '5일 전', views: 245 },
  { id: 12, tag: '정보', title: '소백산 철쭉 개화 시기 정리 (5월 중순 추천)', author: '꽃길만걷자', cm: 11, time: '5일 전', views: 176 },
];

// 건의게시판 (status: wait 접수 / review 검토중 / done 등록완료 / reject 반려)
export const SUGGESTIONS = [
  { id: 1, type: '산 추가', title: '경기 가평 "운악산" 코스 등록 요청합니다', author: '가평주민', status: 'done', statusLabel: '등록완료', cm: 6, time: '어제' },
  { id: 2, type: '경로 수정', title: '북한산 백운대 코스 갈림길 위치가 실제와 달라요', author: '정확러', status: 'review', statusLabel: '검토중', cm: 3, time: '2일 전' },
  { id: 3, type: '기능 제안', title: '저장한 코스 GPX 한 번에 내보내기 기능 어떤가요', author: '효율충', status: 'review', statusLabel: '검토중', cm: 14, time: '2일 전' },
  { id: 4, type: '산 추가', title: '강원 인제 "방태산" 도 추가해주세요', author: '인제사랑', status: 'wait', statusLabel: '접수', cm: 1, time: '3일 전' },
  { id: 5, type: '오류 신고', title: '관악산 상세페이지 고도 그래프가 안 보입니다', author: '버그헌터', status: 'done', statusLabel: '등록완료', cm: 2, time: '4일 전' },
  { id: 6, type: '기능 제안', title: '동행 구하기 게시판도 있으면 좋겠어요', author: '혼산탈출', status: 'reject', statusLabel: '반려', cm: 21, time: '5일 전' },
  { id: 7, type: '경로 수정', title: '지리산 종주 코스 대피소 정보 업데이트 필요', author: '종주왕', status: 'wait', statusLabel: '접수', cm: 0, time: '6일 전' },
  { id: 8, type: '산 추가', title: '전북 "대둔산" 케이블카 코스 등록 부탁', author: '대둔산팬', status: 'done', statusLabel: '등록완료', cm: 4, time: '1주 전' },
];

// 산상세 후기 (별점 대신 '도움돼요' 좋아요 수)
export const REVIEWS = [
  { who: '단풍요정', av: '단', when: '3일 전', likes: 38, body: '백운대 정상에서 보는 뷰가 정말 최고였어요. 단풍 시즌에 가니 사람은 많았지만 그만한 가치가 있었습니다.', tag: '가을 · 백운대 코스' },
  { who: '주말산꾼', av: '주', when: '1주 전', likes: 12, body: '코스 자체는 좋은데 후반부 깔딱고개가 생각보다 빡셉니다. 초보라면 충분히 쉬어가면서 올라가세요.', tag: '중급 · 5시간 소요' },
  { who: '카메라맨', av: '카', when: '2주 전', likes: 27, body: 'GPX 따라가니까 길 잃을 일 없이 편하게 다녀왔습니다. 전망 바위 포인트 강추!', tag: '사진 명소 · GPX 사용' },
];
