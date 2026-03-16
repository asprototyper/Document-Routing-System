import { defineConfig } from 'vite'

export default defineConfig({
  // src/ is the root so index.html lives there
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
