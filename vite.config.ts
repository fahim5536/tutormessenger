import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] as any : [],
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-icons': ['lucide-react'],
            'animations': ['motion', 'framer-motion'],
            'sentry': ['@sentry/react', '@sentry/browser'],
            'supabase': ['@supabase/supabase-js'],
            'radix': [
                '@radix-ui/react-avatar',
                '@radix-ui/react-dialog',
                '@radix-ui/react-dropdown-menu',
                '@radix-ui/react-scroll-area',
                '@radix-ui/react-separator',
                '@radix-ui/react-slot',
                '@radix-ui/react-tabs',
                '@radix-ui/react-toast',
                '@radix-ui/react-tooltip'
            ]
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
