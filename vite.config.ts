import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  server: {
    port: 5173,
    strictPort: false, 
    open: true,
    host: true,
    // Force polling to ensure changes are detected in all environments (Fixes preview not updating)
    watch: {
      usePolling: true,
    }
  }
})