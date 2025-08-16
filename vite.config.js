import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/sales-rep-visite/',   // 👈 this sets the base path
  plugins: [react(), tailwindcss()],
})
