import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ['@wxt-dev/module-vue'],
	vite: () => ({
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './') // or "./src" if using src directory
			}
		}
	})
})
