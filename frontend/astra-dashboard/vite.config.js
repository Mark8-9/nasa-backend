// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000', // <-- لو الباك إند شغال على بورت تاني غير 3000 عدل الرقم ده بس
        changeOrigin: true,
        secure: false,
      }
    }
  }
})