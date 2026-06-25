import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns';

// Ép Node.js ưu tiên localhost thay vì chỉ đích danh 127.0.0.1
dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Vì file này nằm trong thư mục Frontend, ta chỉnh lại đường dẫn cho đúng
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Thêm alias cho thư mục Application để import dễ dàng hơn
      '@app': fileURLToPath(new URL('../Backend/TuneVault.Application', import.meta.url)),
      'react': fileURLToPath(new URL('../node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('../node_modules/react-dom', import.meta.url)),
    },
  },
  server: {
    host: true, // Cho phép truy cập từ network nếu cần, nhưng vẫn dùng localhost cho target
    fs: {
      // Cho phép Vite truy cập ngược ra ngoài để vào thư mục Backend
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5132', // Sử dụng IP thay cho localhost để ổn định hơn
        changeOrigin: true,
        secure: false, 
        timeout: 300000, // Tăng timeout lên 5 phút để khớp với axios.ts
        proxyTimeout: 300000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy Error [API]:', err.message);
          });
        },
      },
      '/media': {
        target: 'http://127.0.0.1:5132',
        changeOrigin: true,
        secure: false,
        timeout: 300000,
      },
      '/notificationHub': {
        target: 'http://127.0.0.1:5132',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});