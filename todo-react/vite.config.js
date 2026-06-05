import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite 설정 — React 플러그인과 Tailwind CSS v4 Vite 플러그인을 등록한다.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
