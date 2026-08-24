import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    // Bind IPv4 explicitly — Vite default can listen on ::1 only on Windows,
    // which breaks http://127.0.0.1:5173 and some browser setups.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: false,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
})
