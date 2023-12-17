import { defineConfig } from 'vite' 

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 3000,
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        }
    },
})