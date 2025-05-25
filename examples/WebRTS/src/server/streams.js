// Модуль для управления стримами
let streams = {}; // { streamId: { streamerId, viewers[] } }

export const createStream = (streamId, connection) => {
  if (!streams[streamId]) {
    streams[streamId] = { viewers: new Map(), connection };
  }
};
export const addViewer = (streamId, viewerId, connection) => {
  if (streams[streamId]) {
    streams[streamId].viewers.set(viewerId, { connection });
    if (streams[streamId].data) {
      return streams[streamId].data;
    }
  }
};
export const removeViewer = (streamId, viewerId) => {
  if (streams[streamId]) {
    if (streams[streamId].viewers.has(viewerId)) {
      const v = streams[streamId].viewers.get(viewerId);
      v.connection.close();
      streams[streamId].viewers.delete(viewerId);
    }
  }
};
export const sendToViewer = (streamId, message, data) => {
  if (streams[streamId]) {
    const viewerId = data.viewerId;
    if (streams[streamId].viewers.has(viewerId)) {
      const v = streams[streamId].viewers.get(viewerId);
      v.connection.send(message);
    }
  }
};
export const sendToStreamer = (streamId, message) => {
  if (streams[streamId]) {
    streams[streamId].connection.send(message);
  }
};

export const getStreams = () => Object.keys(streams);
