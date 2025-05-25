import { defineConfig } from "vite";

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 3000,
    },
    build: {
        rollupOptions: {
            input: {
                index: './index.html',
                streamer: './streamer.html',
                viewer: './viewer.html',
                simple: './simple.html',
            }
        }
    }
})