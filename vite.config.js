import { defineConfig } from 'vite';
import htmlPartials from './scripts/vite/html-partials.js';

export default defineConfig({
  base: './',
  // index.html is assembled from src/partials/** (see scripts/vite/html-partials.js)
  plugins: [htmlPartials({ dir: 'src/partials' })],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    port: 3000
  }
});
