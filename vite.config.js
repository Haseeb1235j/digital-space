import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three')) return 'spatial-engine';
          if (id.includes('react') || id.includes('scheduler')) return 'react-runtime';
          if (id.includes('world-atlas') || id.includes('topojson')) return 'geo-data';
        },
      },
    },
  },
});
