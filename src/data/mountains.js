// 디자인용 더미 산 데이터. 실제 데이터/API 연동은 추후 수동으로.
// TODO(BE): GET /api/mtn/list (산), GET /api/track (경로) 응답으로 교체.
//   BE Mtn{ id, name, location, height, description } / Track{ id, mountainId, name, gpxFilePath, recommendCnt }
//   ↔ 아래 FE 필드(region/dist/time/lv/pal) 매핑 함수 필요(거리/난이도는 track 기준일 수 있음).
// lvN: 1 초급 / 2 중급 / 3 상급 · pal: MountainScene 팔레트
export const MOUNTAINS = [
  { id: 1, rank: 1, name: '북한산', hanja: '北漢山', region: '서울 강북', dist: '5.2km', time: '3h', lv: '중급', lvN: 2, ele: 836, pal: 'forest' },
  { id: 2, rank: 2, name: '관악산', hanja: '冠岳山', region: '서울 관악', dist: '4.1km', time: '2h30', lv: '초급', lvN: 1, ele: 632, pal: 'moss' },
  { id: 3, rank: 3, name: '도봉산', hanja: '道峰山', region: '서울 도봉', dist: '6.8km', time: '4h', lv: '중급', lvN: 2, ele: 740, pal: 'alpine' },
  { id: 4, rank: 4, name: '지리산', hanja: '智異山', region: '전남 구례', dist: '18.4km', time: '9h', lv: '상급', lvN: 3, ele: 1915, pal: 'dusk' },
  { id: 5, rank: 5, name: '한라산', hanja: '漢拏山', region: '제주 서귀포', dist: '9.6km', time: '8h', lv: '상급', lvN: 3, ele: 1947, pal: 'mist' },
  { id: 6, rank: 6, name: '치악산', hanja: '雉岳山', region: '강원 원주', dist: '7.1km', time: '5h', lv: '중급', lvN: 2, ele: 1288, pal: 'dawn' },
  { id: 7, rank: 7, name: '소백산', hanja: '小白山', region: '충북 단양', dist: '11.2km', time: '6h', lv: '중급', lvN: 2, ele: 1439, pal: 'moss' },
  { id: 8, rank: 8, name: '월악산', hanja: '月岳山', region: '충북 제천', dist: '8.3km', time: '5h30', lv: '상급', lvN: 3, ele: 1097, pal: 'forest' },
  { id: 9, rank: 9, name: '설악산', hanja: '雪嶽山', region: '강원 속초', dist: '9.8km', time: '7h30', lv: '상급', lvN: 3, ele: 1708, pal: 'dusk' },
  { id: 10, rank: 10, name: '수락산', hanja: '水落山', region: '서울 노원', dist: '7.2km', time: '4h30', lv: '상급', lvN: 3, ele: 638, pal: 'moss' },
  { id: 11, rank: 11, name: '청계산', hanja: '淸溪山', region: '경기 과천', dist: '5.5km', time: '3h', lv: '초급', lvN: 1, ele: 618, pal: 'forest' },
  { id: 12, rank: 12, name: '무등산', hanja: '無等山', region: '광주 동구', dist: '11.0km', time: '6h', lv: '중급', lvN: 2, ele: 1187, pal: 'mist' },
];

export const REGIONS = [
  { name: '서울', count: 42 },
  { name: '경기', count: 88 },
  { name: '강원', count: 64 },
  { name: '충청', count: 37 },
  { name: '경상', count: 71 },
  { name: '전라', count: 55 },
  { name: '제주', count: 12 },
];

export const FEATURED = {
  id: 9, name: '설악산', sub: '공룡능선', region: '강원 속초', gpx: '9.8KM',
  dist: '9.8km', time: '7h 30m', lv: '상급', ele: '1280m', pal: 'dusk',
};

export function getMountain(id) {
  return MOUNTAINS.find((m) => String(m.id) === String(id)) || MOUNTAINS[0];
}
