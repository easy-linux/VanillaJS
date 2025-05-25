export const getWebSocketAddress = () => {
  const wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";
  const wsHost = location.host; 
  const wsUrl = `${wsProtocol}${wsHost}/ws`;
  return wsUrl;
};
