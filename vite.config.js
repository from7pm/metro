import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://www.seoulmetro.co.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 필요한 헤더 추가
            proxyReq.setHeader('Origin', 'http://www.seoulmetro.co.kr');
            proxyReq.setHeader('Referer', 'http://www.seoulmetro.co.kr/kr/cyberStation.do');
          });
        }
      }
    }
  }
})