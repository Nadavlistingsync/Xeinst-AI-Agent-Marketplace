import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'file:./test.db',
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  deps: {
    inline: ['@prisma/client'],
  },
  build: {
    target: 'esnext',
  },
}); 