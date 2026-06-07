# FE ↔ BE 연동 TODO

백엔드: [NarangHiking/BE](https://github.com/NarangHiking/BE) (Spring Boot · MyBatis · MySQL · Redis · JWT)
응답은 공통 래퍼 `ApiResult<T>` (예: `{ status, message, data }`) 로 내려옵니다 — `res.data` 안의 `data`를 꺼내 쓰세요.

> 코드 곳곳에 `// TODO(BE):` 주석으로 같은 내용을 표시해 두었습니다. (`grep -rn "TODO(BE)" src` 로 한 번에 확인)

## 0. 먼저 만들 것 (공통)
- [ ] **API 클라이언트** (`src/api/client.js`): axios 인스턴스 + `baseURL`(`.env`의 `VITE_API_BASE`).
- [ ] **JWT 인터셉터**: 요청에 `Authorization: Bearer <accessToken>` 자동 첨부.
- [ ] **401 처리**: accessToken 만료 시 `POST /api/auth/reissue`(refreshToken)로 재발급 후 재요청.
- [ ] **토큰 저장소**: accessToken/refreshToken/userId (localStorage 또는 메모리+쿠키).
- [ ] **AuthContext**: 로그인 상태/유저정보 전역 관리 → Header, 보호 라우트에서 사용.
- [ ] `src/data/*` 더미를 실제 API 응답으로 교체.

> ⚠️ 매핑 prefix가 도메인마다 다릅니다. 인증만 `/api/auth/**`, 나머지는 `/user`, `/board`, `/mtn`, `/track`, `/favorite`, `/recommend` 루트입니다. BE의 `application.properties`에서 `server.servlet.context-path`를 확인해 baseURL을 맞추세요.

## 1. 인증 (auth)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| LoginPage | 로그인 | `POST /api/auth/login` `{ email, pass }` → `{ accessToken, refreshToken, userId }` |
| Header | 로그아웃 | `POST /api/auth/logout` |
| (공통) | 토큰 재발급 | `POST /api/auth/reissue` (refreshToken) |
| SignupPage | 회원가입 | `POST /user` `{ email, pass, name }` |

- 소셜 로그인(카카오/네이버/구글) 버튼은 **BE에 해당 엔드포인트가 아직 없음** → OAuth 추가 시 연동.

## 2. 유저 (user)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MyPage | 내 정보 조회 | `GET /user` |
| MyPage / 프로필설정 | 정보 수정 | `PATCH /user` `{ userId, pass, name }` |
| MyPage | 회원 탈퇴(soft delete) | `PATCH /user/remove` |
| Admin 유저관리 | 유저 목록 | `GET /user/list` |
| Admin 유저 등록/수정 | 등록 `POST /user` · 수정 `PATCH /user` | UserResponse: `{ email, name, role, createdAt }` |

## 3. 산 (mtn)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MainPage / MountainListPage | 산 목록 | `GET /mtn/list` |
| MountainDetailPage | 산 상세 | `GET /mtn/{id}` |
| MountainDetailPage | 산의 경로 목록 | `GET /mtn/{mtnId}/track` |
| Admin 산 등록/수정/삭제 | `POST /mtn` · `PUT /mtn/{id}` · `DELETE /mtn/{id}` | Mtn: `{ id, name, location, height, description, originalFilename, storedFilename }` (이미지 업로드) |

## 4. 경로 (track) — GPX
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MountainDetailPage | 경로 상세 (GPX) | `GET /track/{id}` → `{ id, mountainId, name, gpxFilePath, recommendCnt }` |
| SearchResultsPage | 이름 검색 | `GET /track/search?name=` |
| MountainListPage | 조건 검색 | `GET /track?mtnName=&location=&height=` (TrackCondition) |
| Admin 경로 등록/수정/삭제 | `POST /track` · `PUT /track` · `DELETE /track/{id}` | GPX 파일 업로드 → `gpxFilePath` |

- 상세의 **지도/고도 그래프**는 현재 더미 `buildRoute()`로 생성 → 실제 `gpxFilePath`의 GPX를 파싱해 좌표/고도로 그리도록 교체.
- **GPX 다운로드** 버튼 → `gpxFilePath` 링크.

## 5. 즐겨찾기 (favorite) — "저장한 코스"
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| MountainDetail / 카드 ♥ | 저장 추가 | `POST /favorite/{trackId}` |
| 〃 | 저장 해제 | `DELETE /favorite/{trackId}` |
| 〃 | 저장 여부 | `GET /favorite/{trackId}` |
| MyPage 저장한 산 | 내 저장 목록 | `GET /favorite/track` |

## 6. 추천 (recommend) — 경로 "좋아요"
| 동작 | 엔드포인트 |
| --- | --- |
| 추천/해제/여부 | `POST` · `DELETE` · `GET /recommend/{trackId}` |
| 내가 추천한 경로 | `GET /recommend/track` |

## 7. 게시판 (board) + 댓글 (comment)
| 화면 | 동작 | 엔드포인트 |
| --- | --- | --- |
| FreeBoard / SuggestionBoard | 목록(키워드·카테고리) | `GET /board?keyword=&category=` |
| 게시글 상세 | 상세 | `GET /board/{id}` |
| PostWritePage | 작성(이미지 포함) | `POST /board` (multipart) `{ userId, trackId, title, content, category }` + images |
| 게시글 수정 | `PUT /board/{id}` (multipart) |
| 게시글 삭제(soft) | `DELETE /board/{id}` |
| 상세 댓글 | 작성 `POST /board/{boardId}/comment` `{ userId, content }` · 수정 `PATCH /board/{boardId}/comment/{commentId}` · 삭제 `DELETE /board/{boardId}/comment/{commentId}` |

- **자유 vs 건의게시판**은 `category` 값으로 구분(예: `FREE` / `SUGGEST`) — BE 카테고리 enum 확인 후 매핑.
- 건의게시판의 **상태 배지(접수/검토중/등록완료/반려)**, 마이페이지 **등반 기록**, 산상세 **별점 리뷰**는 현재 BE 스키마에 없음 → 추가 협의 필요.

## 8. 라우트 보호 (선택)
- [ ] `/mypage`, `/board/write`, `/suggestions/write`, `/admin/**` 은 로그인/권한 체크 후 접근.
- [ ] `/admin/**` 은 `role === 'ADMIN'` 만 허용 (UserResponse.role).
