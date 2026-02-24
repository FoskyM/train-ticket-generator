import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import obfuscator from 'rollup-plugin-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    obfuscator({
      global: true,
      options: {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        stringArrayEncoding: ['base64'],
        disableConsoleOutput: true,
        debugProtection: true,
        selfDefending: true
        }
      })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})


