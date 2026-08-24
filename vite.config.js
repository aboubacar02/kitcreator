import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'markdown': ['react-markdown', 'remark-gfm'],
          'icons': ['lucide-react', 'react-icons'],
        },
      },
    },
  },
})
