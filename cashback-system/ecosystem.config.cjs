/**
 * PM2 Ecosystem Configuration
 * Configuração para rodar server.js em produção
 */

module.exports = {
  apps: [{
    name: 'stripe-api',
    script: './server.js',
    instances: 1,
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    
    // Logs
    error_file: './logs/stripe-api-error.log',
    out_file: './logs/stripe-api-out.log',
    log_file: './logs/stripe-api-combined.log',
    time: true,
    
    // Restart strategies
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Graceful restart/shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    
    // Error handling
    max_restarts: 10,
    min_uptime: '10s',
    
    // Advanced features
    merge_logs: true,
    
    // Monitoring
    instance_var: 'INSTANCE_ID',
  }]
};
