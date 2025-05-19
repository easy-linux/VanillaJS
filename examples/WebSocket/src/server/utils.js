export const parseServerMessage = (message) => {
  if (Buffer.isBuffer(message)) {
    const str = message.toString("utf-8");
    return JSON.parse(str);
  }
};
