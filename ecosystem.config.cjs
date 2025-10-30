module.exports = {
  apps: [
    {
      name: 'frontend-inventaire',
      script: 'node server/server.cjs',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5173,
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
    },
  ],
}


