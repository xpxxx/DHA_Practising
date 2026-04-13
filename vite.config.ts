import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const base =
    process.env.BASE_PATH ??
    (command === 'build' ? '/DHA_Practising/' : '/')
  return {
    base,
    plugins: [react()],
  }
})
