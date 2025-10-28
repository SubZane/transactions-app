import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        // Reusable backend files
        { src: 'backend/auth-helper.php', dest: 'backend' },
        { src: 'backend/cors.php', dest: 'backend' },
        { src: 'backend/database/backup_database.php', dest: 'backend/database' },

        // API endpoints
        { src: 'backend/users.php', dest: 'backend' },
        { src: 'backend/categories.php', dest: 'backend' },
        { src: 'backend/transactions.php', dest: 'backend' },

        // Database files
        { src: 'backend/database.sqlite', dest: 'backend' },
        { src: 'backend/database/schema.sql', dest: 'backend/database' },
      ],
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
})
