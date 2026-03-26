import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm']
  }
});
