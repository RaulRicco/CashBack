import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Carrega as variáveis do .env (o '' no final carrega todas, não só as VITE_)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Isso substitui tanto process.env quanto import.meta.env durante o build
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://localcashback.com.br'),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://localcashback.com.br')
    },
    server: {
      host: true,
      allowedHosts: ['.sandbox.novita.ai', 'localhost', 'localcashback.com.br', '.bsbichos.com.br'],
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
        }
      }
    }
  }
})
