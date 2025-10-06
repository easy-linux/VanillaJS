import { defineConfig } from 'vite'

export default defineConfig({
  // Настройки для множественных HTML файлов
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        'getters-setters': 'examples/getters-setters.html',
        'proxy': 'examples/proxy.html',
        'reactive-class': 'examples/reactive-class.html',
        'computed': 'examples/computed.html',
        'mutation-observer': 'examples/mutation-observer.html',
        'advanced-system': 'examples/advanced-system.html'
      }
    }
  },
  
  // Настройки сервера разработки
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  }
}) 