import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { fileURLToPath } from 'node:url'

const tailwindConfig = fileURLToPath(new URL('./tailwind.config.js', import.meta.url))

export default defineConfig({
  root: '.',
  envDir: '..',
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss({ config: tailwindConfig }), autoprefixer()],
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true, credentials: 'include' },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
})
