import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BE 서버 (RDS/EC2). 포트 없으면 80.
const API_TARGET = 'http://3.25.47.79';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // 개발용 프록시: 브라우저는 같은 출처(localhost:5173)로 요청하고
    // Vite가 서버 측에서 BE로 전달 → CORS·쿠키(SameSite/Secure) 문제 없음.
    // apiFetch 의 BASE 는 '' 로 두어야 이 프록시를 탄다(.env 의 VITE_API_URL 비워두기).
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
