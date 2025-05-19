export const generateUUID = () => {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    if (typeof crypto.getRandomValues === "function") {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // version RFC 4122

      const byteToHex = [];
      for (let i = 0; i < 256; ++i) {
        byteToHex.push((i + 0x100).toString(16).substring(1));
      }

      return (
        byteToHex[bytes[0]] +
        byteToHex[bytes[1]] +
        byteToHex[bytes[2]] +
        byteToHex[bytes[3]] +
        "-" +
        byteToHex[bytes[4]] +
        byteToHex[bytes[5]] +
        "-" +
        byteToHex[bytes[6]] +
        byteToHex[bytes[7]] +
        "-" +
        byteToHex[bytes[8]] +
        byteToHex[bytes[9]] +
        "-" +
        byteToHex[bytes[10]] +
        byteToHex[bytes[11]] +
        byteToHex[bytes[12]] +
        byteToHex[bytes[13]] +
        byteToHex[bytes[14]] +
        byteToHex[bytes[15]]
      );
    }
  }

  // for really old versions
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const clientId = generateUUID();

export const sendToSocket = (socket, message) => {
  if(socket && socket.readyState === WebSocket.OPEN){
    socket.send(JSON.stringify(message));
  }
}
