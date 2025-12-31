import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      // This ensures that @/components/X maps to src/components/X
      '@': path.resolve(__dirname, './src'),
    }
  },
  // Note: We removed the 'define' block because Vite automatically 
  // handles variables prefixed with VITE_ via import.meta.env
});
