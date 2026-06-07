# FE ↔ BE 연동 TODO

백엔드: [NarangHiking/BE](https://github.com/NarangHiking/BE) (Spring Boot · MyBatis · MySQL · Redis · JWT)
응답은 공통 래퍼 `ApiResult<T>` (예: `{ status, message, data }`) 로 내려옵니다 — `res.data` 안의 `data`를 꺼내 쓰세요.

> **모든 엔드포인트는 `/api` 로 시작합니다.** (BE에서 prefix 통일됨)
> 코드 곳곳에 `// TODO(BE):` 주석으로 같은 내용을 표시해 두었습니다. (`grep -rn "TODO(BE)" src` 로 한 번에 확인)

## 0. 먼저 만들 것 (공통)
- [ ] **API 클라이언트** (`src/api/client.js`): axios 인스턴스 + `baseURL = import.meta.env.VITE_API_BASE` (예: `http://localhost:8080/api`).
- [ ] **JWT 인터셉터**: 요청에 `Authorization: Bearer <accessToken>` 자동 첨부.
- [ ] **401 처리**: accessToken 만료 시 `POST /api/auth/reissue`(refreshToken)로 재발급 후 재요청.
- [ ] **토큰 저장소**: accessToken/refreshToken/userId (localStorage 또는 메모리+쿠키).
- [ ] **AuthContext**: 로그인 상태/유저정보 전역 관리 → Header, 보호 라우트에서 사용.
- [ ] `src/data/*` 더미를 실제 API 응답으로 교체.

> `baseURL` 에 `/api` 까지 포함시키면, 아래 표의 경로는 `/api` 를 뗀 나머지(`/user`, `/board` …)로 호출하면 됩니다. 취향에 맞게 통일하세요.

## 1. 인증 (auth)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| LoginPage | 로그인 | `POST /api/auth/login` `{ email, pass }` → `{ accessToken, refreshToken, userId }` |
| Header | 로그아웃 | `POST /api/auth/logout` |
| (공통) | 토큰 재발급 | `POST /api/auth/reissue` (refreshToken) |
| SignupPage | 회원가입 | `POST /api/user` `{ email, pass, name }` |

- 소셜 로그인(카카오/네이버/구글) 버튼은 **BE에 해당 엔드포인트가 아직 없음** → OAuth 추가 시 연동.

## 2. 유저 (user)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MyPage | 내 정보 조회 | `GET /api/user` |
| MyPage / 프로필설정 | 정보 수정 | `PATCH /api/user` `{ userId, pass, name }` |
| MyPage | 회원 탈퇴(soft delete) | `PATCH /api/user/remove` |
| Admin 유저관리 | 유저 목록 | `GET /api/user/list` |
| Admin 유저 등록/수정 | 등록 `POST /api/user` · 수정 `PATCH /api/user` | UserResponse: `{ email, name, role, createdAt }` |

## 3. 산 (mtn)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MainPage / MountainListPage | 산 목록 | `GET /api/mtn/list` |
| MountainDetailPage | 산 상세 | `GET /api/mtn/{id}` |
| MountainDetailPage | 산의 경로 목록 | `GET /api/mtn/{mtnId}/track` |
| Admin 산 등록/수정/삭제 | `POST /api/mtn` · `PUT /api/mtn/{id}` · `DELETE /api/mtn/{id}` | Mtn: `{ id, name, location, height, description, originalFilename, storedFilename }` (이미지 업로드) |

## 4. 경로 (track) — GPX
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MountainDetailPage | 경로 상세 (GPX) | `GET /api/track/{id}` → `{ id, mountainId, name, gpxFilePath, recommendCnt }` |
| SearchResultsPage | 이름 검색 | `GET /api/track/search?name=` |
| MountainListPage | 조건 검색 | `GET /api/track?mtnName=&location=&height=` (TrackCondition) |
| Admin 경로 등록/수정/삭제 | `POST /api/track` · `PUT /api/track` · `DELETE /api/track/{id}` | GPX 파일 업로드 → `gpxFilePath` |

- 상세의 **지도/고도 그래프**는 현재 더미 `buildRoute()`로 생성 → 실제 `gpxFilePath`의 GPX를 파싱해 좌표/고도로 그리도록 교체.
- **GPX 다운로드** 버튼 → `gpxFilePath` 링크.

## 5. 즐겨찾기 (favorite) — "저장한 코스"
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MountainDetail / 카드 ♥ | 저장 추가 | `POST /api/favorite/{trackId}` |
| 〃 | 저장 해제 | `DELETE /api/favorite/{trackId}` |
| 〃 | 저장 여부 | `GET /api/favorite/{trackId}` |
| MyPage 저장한 산 | 내 저장 목록 | `GET /api/favorite/track` |

## 6. 추천 (recommend) — 코스 "좋아요" (별점 대체)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MountainDetail 좋아요 | 진입 시 여부 | `GET /api/recommend/{trackId}` |
| 〃 | 좋아요/취소 | `POST` · `DELETE /api/recommend/{trackId}` |
| MyPage(누른 좋아요) | 내가 좋아요한 코스 | `GET /api/recommend/track` |

- 좋아요 수는 `Track.recommendCnt`. 산상세 후기 카드의 '👍 도움돼요'도 좋아요형 — 별도 도메인 필요 시 추가.

## 7. 게시판 (board) + 댓글 (comment)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| FreeBoard / SuggestionBoard | 목록(키워드·카테고리) | `GET /api/board?keyword=&category=` |
| 게시글 상세 | 상세 | `GET /api/board/{id}` |
| PostWritePage | 작성(이미지 포함) | `POST /api/board` (multipart) `{ userId, trackId, title, content, category }` + images |
| 게시글 수정 | `PUT /api/board/{id}` (multipart) |
| 게시글 삭제(soft) | `DELETE /api/board/{id}` |
| 상세 댓글 | 작성 `POST /api/board/{boardId}/comment` `{ userId, content }` · 수정 `PATCH /api/board/{boardId}/comment/{commentId}` · 삭제 `DELETE /api/board/{boardId}/comment/{commentId}` |

- **자유 vs 건의게시판**은 `category` 값으로 구분(예: `FREE` / `SUGGEST`) — BE 카테고리 enum 확인 후 매핑.
- 산상세는 **별점 대신 좋아요**(recommend) 사용 — 6번 항목 참고. 후기 텍스트는 board(category=REVIEW) 또는 댓글로.
- 건의게시판 **상태 배지(접수/검토중/등록완료/반려)**: 나중에 추가 예정 (현재 FE 디자인만 유지, BE 컬럼/도메인 추가 시 연동).

## 8. 라우트 보호 (선택)
- [ ] `/mypage`, `/board/write`, `/suggestions/write`, `/admin/**` 은 로그인/권한 체크 후 접근.
- [ ] `/admin/**` 은 `role === 'ADMIN'` 만 허용 (UserResponse.role).
