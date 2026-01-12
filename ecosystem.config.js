/**
 * PM2 Ecosystem Configuration for Teable
 *
 * Usage:
 *   pm2 start ecosystem.config.js                    # Start all apps
 *   pm2 start ecosystem.config.js --only teable-backend
 *   pm2 start ecosystem.config.js --only teable-frontend
 *   pm2 start ecosystem.config.js --env production   # Production mode
 *   pm2 start ecosystem.config.js --env development  # Development mode
 *
 * Prerequisites:
 *   1. pnpm install
 *   2. pnpm g:build (for production)
 *   3. Configure .env files in apps/nestjs-backend and apps/nextjs-app
 */

module.exports = {
  apps: [
    {
      name: 'teable-backend',
      cwd: './apps/nestjs-backend',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production', // Use production mode for WebSocket to share HTTP port
        PORT: 3000,
        PUBLIC_ORIGIN: 'http://127.0.0.1:3000',
        // Required for Prisma (must be in env before process starts)
        PRISMA_DATABASE_URL: 'postgresql://teable:teable@127.0.0.1:54321/teable',
        // Required for cache
        BACKEND_CACHE_PROVIDER: 'redis',
        BACKEND_CACHE_REDIS_URI: 'redis://127.0.0.1:6379/0',
        // Path to nextjs .env for ConfigModule
        NEXTJS_DIR: '../nextjs-app',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        PRISMA_DATABASE_URL: 'postgresql://teable:teable@127.0.0.1:54321/teable',
        BACKEND_CACHE_PROVIDER: 'redis',
        BACKEND_CACHE_REDIS_URI: 'redis://127.0.0.1:6379/0',
        NEXTJS_DIR: '../nextjs-app',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        PRISMA_DATABASE_URL: 'postgresql://teable:teable@127.0.0.1:54321/teable',
        BACKEND_CACHE_PROVIDER: 'redis',
        BACKEND_CACHE_REDIS_URI: 'redis://127.0.0.1:6379/0',
        NEXTJS_DIR: '../nextjs-app',
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      merge_logs: true,
    },
    {
      name: 'teable-frontend',
      cwd: './apps/nextjs-app',
      script: 'npx',
      args: 'next start -p 3002',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        PUBLIC_ORIGIN: 'http://127.0.0.1:3000', // Backend API URL
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        PUBLIC_ORIGIN: 'http://127.0.0.1:3000',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3002,
        PUBLIC_ORIGIN: 'http://127.0.0.1:3000',
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      merge_logs: true,
    },
  ],
};
