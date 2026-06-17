# 에러 로그

---

## #1 — Rules of Hooks: Hook이 조건부 return 뒤에 위치

### 문제
```
Warning: React has detected a change in the order of Hooks called by App.
Uncaught Error: Rendered more hooks than during the previous render.
```

### 원인
React Hook(`useEffect`, `useMemo`, `useState` 등)은 **매 렌더링마다 항상 같은 순서로 호출**되어야 한다.  
그런데 `if (loading) return null` 같은 조건부 early return 뒤에 Hook을 호출하면,  
`loading = true`일 때와 `false`일 때 Hook 호출 개수가 달라져서 React가 state를 잘못 추적한다.

**App.jsx — 잘못된 코드**
```jsx
if (initializing) return null;  // ← early return
useEffect(() => { ... }, [pathname]);  // ← Hook이 return 뒤에 있음 ❌
```

**MountainDetailPage.jsx — 잘못된 코드**
```jsx
if (loading) return <div>불러오는 중…</div>;  // ← early return
const builtRoute = useMemo(() => ..., [...]);  // ← Hook이 return 뒤에 있음 ❌
```

### 해결
모든 Hook을 조건부 return **앞으로** 이동. 값이 없을 때는 optional chaining(`?.`)으로 안전하게 접근.

```jsx
// Hook 먼저
useEffect(() => { ... }, [pathname]);
const builtRoute = useMemo(() => buildRoute(mtn?.id ?? 1, ...), [mtn?.id, ...]);

// 그 다음 early return
if (initializing) return null;
if (loading) return <div>불러오는 중…</div>;
```

### 규칙
> Hook은 컴포넌트 최상단에, 조건문/반복문/return 밖에서만 호출한다.

---

## #2 — JSX 삼항 연산자에서 여러 형제 요소 반환

### 문제
```
SyntaxError: Adjacent JSX elements must be wrapped in an enclosing tag
```

### 원인
삼항 연산자(`:`) 뒤에 여러 JSX 요소가 나란히 있으면 JSX가 파싱 불가.  
React는 항상 단일 루트 요소를 반환해야 한다.

**잘못된 코드**
```jsx
{condition
  ? <p>없음</p>
  : (
  <div>A</div>
  <div>B</div>   {/* ← 형제 요소 ❌ */}
  <div>C</div>
)}
```

### 해결
`<>...</>` (Fragment)로 감싸서 단일 루트로 만든다.

```jsx
{condition
  ? <p>없음</p>
  : (
  <>
    <div>A</div>
    <div>B</div>
    <div>C</div>
  </>
)}
```

---

## #3 — 변수명 변경 후 잔재 참조 오류

### 문제
```
Uncaught ReferenceError: m is not defined
  at MountainDetailPage (MountainDetailPage.jsx:241)
```

### 원인
`m` → `mtn`으로 변수명을 바꾸는 과정에서 JSX 하단의 일부 `m.id` 참조를 미처 바꾸지 못했다.

### 해결
파일 전체에서 `m.id`, `m.name` 등 잔재 참조를 찾아 `mtn.id`, `mtn.name`으로 교체.

### 예방법
변수명 변경 시 에디터의 **전체 파일 검색**(Ctrl+F)으로 잔재 참조 확인 후 일괄 교체.

---

## #4 — VITE_API_URL 미설정으로 API 요청이 FE 서버로 전송

### 문제
```
POST http://localhost:5173/api/auth/login 404 (Not Found)
```

### 원인
`import.meta.env.VITE_API_URL`이 설정되지 않아 `BASE = ""`(빈 문자열).  
fetch URL이 `/api/auth/login`이 되어 FE 개발 서버(5173)로 요청이 가고, 해당 경로가 없으니 404.

### 해결
프로젝트 루트에 `.env.local` 파일 생성:
```
VITE_API_URL=http://localhost:8080
```
이후 `npm run dev` 재시작 (Vite는 env 파일 변경 시 재시작 필요).

---

## #5 — ApplicationContext failure threshold exceeded (Spring Boot 테스트)

### 문제
```
java.lang.IllegalStateException: ApplicationContext failure threshold (1) exceeded
Caused by: java.lang.IllegalArgumentException: pattern must start with a /
```

### 원인
`SecurityConfig.java`의 `requestMatchers`에 `/`로 시작하지 않는 URL 패턴이 들어간 것으로 추정.  
Spring Security 7은 `PathPatternRequestMatcher`를 사용하며 모든 패턴이 `/`로 시작해야 한다.

### 해결
`permitUrls` 배열 및 `requestMatchers` 호출부의 모든 패턴이 `/`로 시작하는지 확인 후 수정.
