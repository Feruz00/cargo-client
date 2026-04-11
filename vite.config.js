import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import Components from 'unplugin-vue-components/vite';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    cssCodeSplit: false, // Merge all CSS into one file (reduces requests)
    minify: 'esbuild', // or 'terser'
    sourcemap: false, // disable in prod
    rollupOptions: {
      output: {
        manualChunks: {
          // Group heavy deps
          vendor: ['vue', 'vue-router', 'axios' /* add others */],
        },
      },
    },
  },
});
