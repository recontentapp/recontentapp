import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['design-system', 'email-renderer'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /design-system/, /email-renderer/],
    },
  },
})
