import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// npm run dev 시 /api 요청을 프록시할 BE.
// 기본: 배포된 EC2. 로컬 BE로 붙으려면 'http://localhost:8080' 으로 바꾸세요.
const API_TARGET = 'http://3.25.47.79';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost', // BE가 내려준 쿠키 도메인 → localhost 로 재작성(로그인 유지)
      },
    },
  },
});