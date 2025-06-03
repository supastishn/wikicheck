import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/wikicheck/', // 👷‍♂️ Add this line
  plugins: [vue()],
})
