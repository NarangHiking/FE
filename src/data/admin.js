// 어드민 더미 데이터 (유저 / 산 / 경로)
// TODO(BE): GET /user/list (유저), GET /mtn/list (산), GET /track (경로) 응답으로 교체.
export const ADMIN_USERS = [
  { id: 'U-1042', name: '산소년', email: 'mountain.boy@example.com', role: 'user', roleLabel: '일반', posts: 23, joined: '2026-01-12' },
  { id: 'U-1041', name: 'gpx마스터', email: 'gpx.master@example.com', role: 'user', roleLabel: '일반', posts: 88, joined: '2026-01-08' },
  { id: 'U-1003', name: '관리자', email: 'admin@narang.kr', role: 'admin', roleLabel: '관리자', posts: 5, joined: '2025-12-01' },
  { id: 'U-0998', name: '백패커J', email: 'backpacker.j@example.com', role: 'user', roleLabel: '일반', posts: 41, joined: '2025-12-20' },
  { id: 'U-0975', name: '광고봇', email: 'spam.bot@spam.io', role: 'banned', roleLabel: '정지', posts: 0, joined: '2025-11-30' },
  { id: 'U-0960', name: '제주댁', email: 'jeju.lady@example.com', role: 'user', roleLabel: '일반', posts: 17, joined: '2025-11-22' },
  { id: 'U-0931', name: '겨울곰', email: 'winter.bear@example.com', role: 'user', roleLabel: '일반', posts: 9, joined: '2025-11-05' },
];

export const ADMIN_MOUNTAINS = [
  { id: 'M-001', name: '북한산', region: '서울 강북', ele: 836, routes: 6, status: '공개', updated: '2026-05-30' },
  { id: 'M-002', name: '관악산', region: '서울 관악', ele: 632, routes: 4, status: '공개', updated: '2026-05-28' },
  { id: 'M-003', name: '지리산', region: '전남 구례', ele: 1915, routes: 9, status: '공개', updated: '2026-05-21' },
  { id: 'M-004', name: '한라산', region: '제주 서귀포', ele: 1947, routes: 5, status: '공개', updated: '2026-05-18' },
  { id: 'M-013', name: '운악산', region: '경기 가평', ele: 935, routes: 1, status: '검수중', updated: '2026-06-05' },
  { id: 'M-014', name: '방태산', region: '강원 인제', ele: 1444, routes: 0, status: '비공개', updated: '2026-06-06' },
];

export const ADMIN_ROUTES = [
  { id: 'R-1201', mountain: '북한산', name: '백운대 정규 코스', dist: '5.2km', lv: '중급', gpx: '있음', status: '공개' },
  { id: 'R-1202', mountain: '북한산', name: '사패산 능선 코스', dist: '8.1km', lv: '상급', gpx: '있음', status: '공개' },
  { id: 'R-1185', mountain: '관악산', name: '사당 능선 코스', dist: '4.1km', lv: '초급', gpx: '있음', status: '공개' },
  { id: 'R-1186', mountain: '관악산', name: '과천 향교 코스', dist: '5.0km', lv: '중급', gpx: '없음', status: '검수중' },
  { id: 'R-1150', mountain: '지리산', name: '천왕봉 종주', dist: '18.4km', lv: '상급', gpx: '있음', status: '공개' },
  { id: 'R-1301', mountain: '운악산', name: '현등사 코스', dist: '6.3km', lv: '중급', gpx: '검수중', status: '검수중' },
];

export const ADMIN_KPIS = [
  { k: '가입 유저', v: '4,128', delta: '▲ 2.4%', dir: 'up' },
  { k: '등록 산', v: '369', delta: '▲ 6', dir: 'up' },
  { k: '등록 경로', v: '1,284', delta: '▲ 31', dir: 'up' },
  { k: '대기 건의', v: '17', delta: '▼ 3', dir: 'down' },
];

// 수정 모드에서 id 로 기존 레코드 조회 (없으면 undefined)
export const findUser = (id) => ADMIN_USERS.find((u) => u.id === id);
export const findMountain = (id) => ADMIN_MOUNTAINS.find((m) => m.id === id);
export const findRoute = (id) => ADMIN_ROUTES.find((r) => r.id === id);

// 셀렉트 옵션
export const MOUNTAIN_NAMES = ADMIN_MOUNTAINS.map((m) => m.name);
