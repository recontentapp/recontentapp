import reactRefresh from '@vitejs/plugin-react-refresh'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  root: './ui-src',
  plugins: [reactRefresh(), viteSingleFile()],
  optimizeDeps: {
    include: ['design-system'],
  },
  build: {
    target: 'esnext',
    cssCodeSplit: false,
    outDir: '../dist',
    commonjsOptions: {
      include: [/node_modules/, /design-system/],
    },
    rollupOptions: {
      output: {
        manualChunks: () => 'everything.js',
      },
    },
  },
})
