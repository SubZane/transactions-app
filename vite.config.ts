import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Transactions App',
        short_name: 'Transactions',
        description: 'Household transaction management app',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        // Online-first strategy
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Match localhost backend API calls
            urlPattern: ({ url }) =>
              url.origin === 'http://localhost' && url.pathname.includes('/backend/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
    viteStaticCopy({
      targets: [
        // .htaccess for Apache routing
        { src: 'public/.htaccess', dest: '' },

        // Reusable backend files
        { src: 'backend/auth-helper.php', dest: 'backend' },
        { src: 'backend/cors.php', dest: 'backend' },
        { src: 'backend/database/backup_database.php', dest: 'backend/database' },
        { src: 'backend/database/config.php', dest: 'backend/database' },
        { src: 'backend/database/migrate_add_user_id_column.php', dest: 'backend/database' },

        // API endpoints
        { src: 'backend/users.php', dest: 'backend' },
        { src: 'backend/categories.php', dest: 'backend' },
        { src: 'backend/transactions.php', dest: 'backend' },

        // Database files and data directory
        { src: 'backend/database.sqlite', dest: 'backend' },
        { src: 'backend/database/schema.sql', dest: 'backend/database' },
        { src: 'data', dest: 'data' },
      ],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          'supabase-vendor': ['@supabase/supabase-js'],
          'utils-vendor': ['axios', 'xlsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 KB
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})
