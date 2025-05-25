import { createPeer } from "./client/stream";
import { getWebSocketAddress } from "./utils";
let peer;
let stream;
let streamId = crypto.randomUUID();

const peers = {};
document.getElementById("startStream").onclick = async () => {
  stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
};
// protocol is ws if client uses http protocol and wss for https
const ws = new WebSocket(`${getWebSocketAddress()}?role=streamer&streamId=${streamId}`);

function addViewer(viewerId) {
  const peer = new SimplePeer({
    initiator: true,
    trickle: false,
    stream: stream,
  });

  // when you have to  send a signal to a viewer
  peer.on("signal", (data) => {
    ws.send(JSON.stringify({ streamer: true, type: 'signal', viewerId, data }));
  });

  peers[viewerId] = peer;
}

// When you are getting a signal from a viewer
function handleSignalFromViewer(viewerId, signal) {
  if (peers[viewerId]) {
    peers[viewerId].signal(signal);
  }
}

ws.onopen = () => {
  // ws.send(JSON.stringify({ type: "viewer", streamId: id }));
};

const handleMessage = (message) => {
  const data = JSON.parse(message);
  if (data.viewer) {
    switch (data.type) {
      case "signal": {
          handleSignalFromViewer(data.viewerId, data.data);
        break;
      }
      case "addViewer": {
          addViewer(data.viewerId);
        break;
      }
    }
  }
};

ws.onmessage = async (event) => {
  if (event.data instanceof Blob) {
    const blobData = await event.data.text();
    handleMessage(blobData);
  } else {
    handleMessage(event.data);
  }
};
ws.onclose = () => {
  console.log("WebSocket connection closed");
};

ws.onerror = (err) => {
  console.error("WebSocket error:", err);
};
