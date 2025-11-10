import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.VITE_LANGFLOW_API_KEY': JSON.stringify(env.VITE_LANGFLOW_API_KEY || env.LANGFLOW_API_KEY),
        'import.meta.env.VITE_LANGFLOW_API_URL': JSON.stringify(env.VITE_LANGFLOW_API_URL || env.LANGFLOW_API_URL),
        'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(env.VITE_ADMIN_EMAIL),
        'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
