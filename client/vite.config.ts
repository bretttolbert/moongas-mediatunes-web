import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite runs under Node. Load env from .env files AND process.env.
// (loadEnv only returns VITE_*-prefixed vars, so merge in process.env too.)
const env = { ...loadEnv('', process.cwd(), ''), ...process.env }

// Backend (mediatunes-svc) serving the JSON API and media files.
const backendUrl = env.BACKEND_URL ?? 'http://127.0.0.1:5000'
// Path prefix the backend's JSON API is served under (e.g. "/api").
// Media files (/getfile/*) are served at the backend root, WITHOUT this prefix.
const apiPrefix = env.BACKEND_URL_PREFIX ?? ''

// Proxy options shared by /api and /getfile. /getfile is NOT prefixed because
// the backend serves it at the root; only the JSON API lives under apiPrefix.
const proxyOpts = {
  target: backendUrl,
  changeOrigin: true,
} as const

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': { ...proxyOpts, rewrite: (p: string) => `${apiPrefix}${p}` },
      '/getfile': proxyOpts,
    },
  },
})
