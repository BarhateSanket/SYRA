import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',   // ⭐ CRITICAL FIX FOR VERCEL DEPLOY
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
})
