import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages 项目页部署在 https://<user>.github.io/cuis/ 下，
// 构建产物需以 /cuis/ 作为资源基路径；本地开发仍以 / 为基路径。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/cuis/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
