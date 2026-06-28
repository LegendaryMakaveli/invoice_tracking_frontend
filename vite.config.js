import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://mybench.localhost',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
        headers: {
          'Expect': ''
        }
      }
    }
  }
})
