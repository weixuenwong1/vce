import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),

    legacy({
      targets: ['defaults', 'iOS >= 12', 'Safari >= 12'], 
    }),

    viteCompression({ algorithm: 'gzip'}),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br'}),
    visualizer({ filename: 'stats.html', open: false, gzipSize: true, brotliSize: true }),
  ],
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // CORE
          reactvendor: ['react', 'react-dom', 'react-router-dom'],

          // UI
          mui: ['@mui/material'],
          icons: ['@mui/icons-material', 'lucide-react'],

          // DATA + NOTIFICATIONS
          network: ['axios'],
          toast: ['react-toastify'],

          // FORMS & VALIDATION
          forms: ['react-hook-form', '@hookform/resolvers', 'yup'],

          // MARKDOWN PIPELINE 
          markdown: [
            'react-markdown',
            'remark-gfm',
            'remark-breaks',
            'rehype-raw',
          ],

          // MATH RENDERING 
          math: [
            'katex',
            'better-react-mathjax',
            'remark-math',
            'rehype-katex',
            'rehype-mathjax',
          ],

          // WEBGL / 3D
          ogl: ['ogl'],

          // STYLES
          sass: ['sass'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'axios',
    ],
  },
});