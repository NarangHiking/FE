/**
 * AuthContext — httpOnly 쿠키 기반 인증 (클라이언트 무저장)
 *
 * 토큰도, 유저 정보도 localStorage/sessionStorage에 저장하지 않는다.
 * 인증 상태는 오직 서버(쿠키)에서 파생된다.
 *
 *   앱 로드 → GET /api/user → 200: 로그인 상태 / 401: 비로그인
 *
 * 새로고침 시 쿠키가 살아있으면 자동으로 로그인 상태 복원.
 */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const BASE = import.meta.env.VITE_API_URL ?? '';

// ─────────────────────────────────────────────
// apiFetch — credentials:'include' 자동 포함 래퍼
// 401 응답 시 전역 logout 이벤트 발행 → AuthProvider가 감지해서 state 초기화
// ─────────────────────────────────────────────
export function apiFetch(path, options = {}) {
  // FormData(멀티파트)일 땐 Content-Type 을 브라우저가 boundary 포함해 직접 설정해야 하므로 지정하지 않는다.
  const isForm = options.body instanceof FormData;
  return fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  }).then((res) => {
    if (res.status === 401) {
      // 쿠키가 만료/삭제됐는데 FE state가 로그인 상태인 경우 동기화
      window.dispatchEvent(new Event('auth:logout'));
    }
    return res;
  });
}

export function AuthProvider({ children }) {
  // user: null(비로그인) | { userId, email, name, role }
  const [user, setUser] = useState(null);
  // 초기 로드 중 여부 — 로그인 상태 확인 전에 UI가 깜빡이지 않도록
  const [initializing, setInitializing] = useState(true);

  // ─────────────────────────────────────────────
  // 앱 로드 시 쿠키로 로그인 상태 확인
  //   GET /api/user → 200: 유저 정보 세팅 / 401: 비로그인
  // ─────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/api/user')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setUser(json.data ?? json);
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  // apiFetch에서 401 발생 시 → user state 초기화 (쿠키-state 동기화)
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  async function login(email, pass) {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, pass }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 서버가 쿠키를 심은 직후 유저 정보 조회
    const userRes = await apiFetch('/api/user');
    if (!userRes.ok) throw new Error('유저 정보를 불러오지 못했습니다.');
    const json = await userRes.json();
    setUser(json.data ?? json);
  }

  async function logout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 는 <AuthProvider> 안에서 사용해야 합니다.');
  return ctx;
}
