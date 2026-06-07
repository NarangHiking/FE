import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 디자인 전용 SPA. 기능(API/상태/인증 등)은 추후 수동으로 추가.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
});
