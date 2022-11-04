import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5000,
  },
  build: {
    target: "es2017",
    outDir: "build",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "./index.html"),
        page1: resolve(__dirname, "./page1.html"),
        page2: resolve(__dirname, "./page2.html"),
        page3: resolve(__dirname, "./page3.html"),
      },
      output: {
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? "")) {
            return "assets/images/[name]-[hash][extname]";
          }

          if (/\.(ttf|otf|fnt|woff)$/.test(name ?? "")) {
            return "assets/fonts/[name]-[hash][extname]";
          }

          if (/\.css$/.test(name ?? "")) {
            return "assets/css/[name]-[hash][extname]";
          }

          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
