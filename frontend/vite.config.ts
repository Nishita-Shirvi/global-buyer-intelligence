import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The frontend never talks to ITC Trade Map or Volza directly for data.
// In development, /api is proxied to the FastAPI backend (default port 8000).
// Override with VITE_API_PROXY_TARGET, e.g. `VITE_API_PROXY_TARGET=http://localhost:9000 npm run dev`.
const apiTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // three.js (~250 kB gzipped) is lazy-loaded with the dashboard globe only.
  build: { chunkSizeWarningLimit: 1000 },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
})
