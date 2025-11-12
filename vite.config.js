import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const base = (command === 'build' && process.env.VITE_DEPLOY_TARGET === 'gh-pages') ? '/mtst/' : '/'
  return {
    base: base,
    plugins: [react()],
    resolve: {
      alias: {
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      }
    }
  }
});
