import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ngrok: uncomment server block below and comment it out for local
  // server: {
  //   allowedHosts: ['turbulent-dainty-glance.ngrok-free.dev'],
  // },
})
