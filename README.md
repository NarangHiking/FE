# 나랑등산이다 🥾⛰

산 이름·지역·거리로 GPX 트래킹 코스를 찾는 등산 커뮤니티 서비스 — React + Vite 프론트엔드 프로젝트.

## 팀원별 기여 내역

### 👤 황우찬 (cmy397264)

#### 🎨 UI/UX 전체 설계 및 구현
- 프로젝트 초기 세팅 (React + Vite, 디자인 시스템 구축)
- 리소그래프 스타일 디자인 시스템 설계 (색상 토큰, 폰트, 컴포넌트)
- 전체 페이지 레이아웃 및 반응형 처리

#### 📄 페이지 개발
- 메인 페이지, 산 목록/상세 페이지
- 자유게시판·건의게시판 (목록/상세/작성/수정)
- 마이페이지, 관리자 페이지 (유저/산/경로 관리, 페이지네이션)
- 로그인·회원가입 UI

#### 🗺 산 상세 페이지
- Leaflet 지도 + GPX 트랙 시각화
- 기상청 날씨 연동 (일자별 탭, 시간대별 슬롯)
- 코스 즐겨찾기·추천 UI
- 코스별 후기(댓글) CRUD UI

#### 🤖 AI 챗봇 UI
- 플로팅 AI 어시스턴트 패널 (RAG 챗봇 연동)
- 추천 칩, 대화 스크롤, 로딩 상태 처리

#### 🔧 API 연동 및 인증
- `apiFetch` 래퍼 함수 (자동 토큰 재발급, 401 처리)
- `AuthContext` 전역 인증 상태 관리
- Vercel 배포 설정 (vite.config, rewrite 규칙)

---

## 실행 방법

Node.js(18+)가 필요합니다. ([nodejs.org](https://nodejs.org)에서 설치)

```bash
npm install   # 의존성 설치 (최초 1회)
npm run dev   # 개발 서버 → http://localhost:5173
npm run build # 프로덕션 빌드 (dist/)
```

## 페이지 구성 / 라우트

| 라우트 | 페이지 | 파일 |
| --- | --- | --- |
| `/` | 메인 | `src/pages/MainPage.jsx` |
| `/mountains` | 산 목록 (필터·정렬·페이지네이션) | `src/pages/MountainListPage.jsx` |
| `/mountains/:id` | 산 상세 (지도·고도·후기) | `src/pages/MountainDetailPage.jsx` |
| `/board` | 자유게시판 | `src/pages/FreeBoardPage.jsx` |
| `/suggestions` | 건의게시판 | `src/pages/SuggestionBoardPage.jsx` |
| `/mypage` | 마이페이지 | `src/pages/MyPage.jsx` |
| `/admin/:tab` | 어드민 (유저/산/경로 관리) | `src/pages/AdminPage.jsx` |

`:tab` = `users` · `mountains` · `routes`

## 폴더 구조

```
src/
├─ main.jsx                # 진입점 (라우터 + CSS import)
├─ App.jsx                 # 라우트 정의 (어드민은 자체 레이아웃)
├─ components/
│  ├─ Header.jsx           # 공통 상단 네비
│  ├─ Footer.jsx           # 공통 푸터
│  ├─ MountainCard.jsx     # 산 카드
│  ├─ MountainScene.jsx    # 리소그래프 산 풍경 SVG 생성기
│  └─ TrailMap.jsx         # 등고선 지도 + 고도 프로필 생성기
├─ pages/                  # 7개 페이지
├─ data/                   # 더미 데이터 (mountains / posts / admin)
└─ styles/
   ├─ base.css             # 디자인 시스템 토큰 + 공통 컴포넌트
   └─ pages.css            # 페이지별 스타일
```

## 디자인 시스템

"B급인 척하는 S급" — 리소그래프(실크스크린) 질감 + 빡빡한 그리드.

- **색**: 따뜻한 종이 `#efe9db` / 잉크 `#18211c` / 트레일 오렌지 `#ef6a39` / 포레스트 `#1f7a5a` / 골드 `#e9b949`
- **폰트**: Black Han Sans(제목) · Pretendard(본문) · Space Mono(라벨)
- **특징**: 두꺼운 테두리(2.5px) + 하드 오프셋 그림자(`Npx Npx 0 ink`)
- 색·폰트 토큰은 `src/styles/base.css` 상단 `:root`에서 한 번에 수정 가능합니다.

## 기능을 붙일 때 (TODO 힌트)

- 검색/필터/정렬: 각 페이지의 `useState` 값을 실제 데이터 쿼리에 연결
- 라우팅 데이터: `src/data/*` 더미를 API 응답으로 교체
- 로그인/회원가입: `Header`의 버튼 → 인증 페이지/모달 추가
- 좋아요·저장: `MountainCard`의 `fav` 상태를 서버와 동기화
- 어드민 CRUD: 테이블 행의 ✎ / 🗑 버튼에 핸들러 연결
