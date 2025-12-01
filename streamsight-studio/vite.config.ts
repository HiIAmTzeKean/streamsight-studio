import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: '.',
  build: {
    outDir: 'dist'
  },
  define: {
    'import.meta.env.VITE_BACKEND_BASE_URL': JSON.stringify(
      process.env.VITE_BACKEND_BASE_URL || 'http://localhost:9000'
    ),
  },
  server: {
    port: 8000,
    watch: {
      usePolling: true,  // Enable polling for Docker
    },
  }
})
