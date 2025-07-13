// Инжект в основной контекст страницы
function injectWebSocketInterceptor() {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      const OriginalWebSocket = window.WebSocket;
      
      window.WebSocket = function(url, protocols) {
        console.log('🔍 WebSocket создан:', url);
        
        // Создаем оригинальный WebSocket
        const socket = new OriginalWebSocket(url, protocols);

        window.postMessage({
          type: "WS_CREATED",
          payload: {
            url: url,
            protocols: protocols
          }
        }, "*");

        socket.addEventListener('message', (event) => {
          window.postMessage({
            type: "WS_MESSAGE",
            payload: event.data
          }, "*");
        });

        // Перехват send
        const originalSend = socket.send;
        socket.send = function (...args) {
          console.log("[WS] SEND:", args);
          return originalSend.apply(this, args);
        };

        // Получаем команды от content.js
        window.addEventListener("message", (event) => {
          if (event.source !== window) return;
          if (event.data?.type === "WS_SEND") {
            console.log("[WS] ВСТАВКА ИЗ content.js", event.data.payload);
            
            if (socket.readyState === WebSocket.OPEN) {
               console.log('отправка:', event.data.payload);
               socket.send(event.data.payload);
            }
          } else if (event.data?.type === "WS_CLOSE_MESSAGE") {
            const modal = document.querySelector("#game-over-panel");
            const message = document.querySelector(".modal-message");
            if (modal) {
              modal.style.display = "none";
            }
            if(message){
              message.textContent = "";
            }
          }
        });
        
        return socket;
      };
      
      // Копируем статические свойства
      Object.setPrototypeOf(window.WebSocket, OriginalWebSocket);
      Object.defineProperty(window.WebSocket, 'prototype', {
        value: OriginalWebSocket.prototype,
        writable: false
      });
    })();
  `;

  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// Выполняем как можно раньше
if (document.readyState === 'loading') {
  injectWebSocketInterceptor();
} else {
  // Если документ уже загружен, может быть поздно
  injectWebSocketInterceptor();
}