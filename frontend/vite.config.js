import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    // Force a single React instance. Without this, Vite can pre-bundle React
    // into more than one chunk (you'll see react.js?v=aaa and
    // react-dom_client.js?v=bbb with different hashes) — dependencies like
    // Zustand then grab a different React than the app does, and every hook
    // call blows up with "Invalid hook call / cannot read useCallback".
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Pre-bundle these together in one pass so they share the same React.
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'zustand',
      'lucide-react',
      'react-router-dom',
      '@tanstack/react-query',
      'socket.io-client',
    ],
  },
})