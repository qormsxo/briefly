import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const apiUrl =
    process.env.VITE_API_URL ||
    (mode === 'production'
      ? 'https://feed-briefly.onrender.com'
      : 'http://localhost:3000');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
    },
    server: {
      port: 5173,
    },
  };
});
