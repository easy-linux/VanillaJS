import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    target: "es2017",
    outDir: "build",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "./index.html"),
        main2: resolve(__dirname, "./index2.html"),
      },
    },
  },
});
