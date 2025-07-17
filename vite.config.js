import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Tell Vite not to try bundling this module (fixes Netlify build errors)
      external: ['uuid'],
    },
  },
});


