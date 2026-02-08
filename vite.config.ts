import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    tailwindcss(),
    nodePolyfills(),
  ],
  optimizeDeps: {
    // Force Vite to pre-bundle all OrbitDB dependencies
    include: [
      '@orbitdb/core',
      'eventemitter3',
      'lru',
      'timeout-abort-controller',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
})
