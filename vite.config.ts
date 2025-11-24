import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Required for Capacitor
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          audio: ['./src/lib/iosAudioEngine.ts'],
          sessions: ['./src/lib/sessionProtocols.ts']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})

