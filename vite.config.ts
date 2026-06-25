import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': fileURLToPath(new URL('./Frontend/src', import.meta.url)),
      'react': fileURLToPath(new URL('./node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
    },
  },
  server: {
    fs: {
      // Cho phép Vite truy cập vào các thư mục nằm ngoài root (như Backend)
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5132', 
        changeOrigin: true,
        secure: false, 
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        },
      },
      '/media': {
        target: 'http://localhost:5132',
        changeOrigin: true,
        secure: false,
      },
      '/notificationHub': {
        target: 'http://localhost:5132',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});