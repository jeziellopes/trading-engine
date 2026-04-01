/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// PRD target: initial bundle ≤ 200KB gzipped
// recharts and react-grid-layout are lazy-loaded via React.lazy()
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    reactCompilerPreset(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
