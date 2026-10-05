import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { motionStudio } from 'motion-studio'

export default defineConfig({
  // Motion Studio first: dev only timeline panel (press the timeline button or Alt+T)
  plugins: [motionStudio(), react(), tailwindcss()],
  resolve: {
    // shadcn and Kokonut UI conventions import from "@/..."
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
