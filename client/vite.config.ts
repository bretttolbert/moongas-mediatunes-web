import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite runs under Node. Load env from .env files AND process.env.
// (loadEnv only returns VITE_*-prefixed vars, so merge in process.env too.)
const env = { ...loadEnv('', process.cwd(), ''), ...process.env }

// Backend (mediatunes-svc) serving the JSON API and media files.
const backendUrl = env.BACKEND_URL ?? 'http://127.0.0.1:5000'
// Path prefix the backend serves under, if any (empty when unset).
const backendPrefix = env.BACKEND_URL_PREFIX ?? ''

// Proxy options shared by /api and /getfile.
const proxyOpts = {
  target: backendUrl,
  changeOrigin: true,
  rewrite: (p: string) => `${backendPrefix}${p}`,
} as const

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': proxyOpts,
      '/getfile': proxyOpts,
    },
  },
})
