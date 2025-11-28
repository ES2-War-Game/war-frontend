import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'game-logic': [
            './src/service/gameService.ts',
            './src/hook/useGame.ts',
            './src/store/useGameStore.ts',
          ],
          'websocket': [
            './src/hook/useWebSocket.ts',
            './src/hook/useChat.ts',
          ],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
  },
  server: {
    host: true,
  },
  esbuild: {
    target: 'es2020',
    drop: ['console', 'debugger'],
  },
})
