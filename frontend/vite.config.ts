import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/token': {
          target: env.VITE_TOKEN_SERVER_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/chat': {
          target: env.VITE_CHAT_SERVER_URL || 'http://localhost:8081',
          changeOrigin: true,
        },
        '/reservations': {
          target: env.VITE_RESERVATIONS_SERVER_URL || 'http://localhost:8082',
          changeOrigin: true,
        },
        '/room-bookings': {
          target: env.VITE_ROOMS_SERVER_URL || 'http://localhost:8083',
          changeOrigin: true,
        },
      },
    },
  };
});
