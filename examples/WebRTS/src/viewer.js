import { createPeer } from "./client/stream";
import { getWebSocketAddress } from "./utils";
let peer;
let ws;
const viewerId = crypto.randomUUID();

document.getElementById("joinStream").onclick = () => {
  const streamId = document.getElementById("streamId").value;
  if (ws) {
    ws.close();
  }
  
  // protocol is ws if client uses http protocol nand wss for https
  ws = new WebSocket(`${getWebSocketAddress()}?role=viewer&streamId=${streamId}&viewerId=${viewerId}`);
  ws.onopen = () => {
    ws.send(JSON.stringify({ viewer: true, type: "addViewer", streamId, viewerId }));
  };

const handleMessage = (message) => {
  const data = JSON.parse(message);
  if(data.streamer){
    switch(data.type){
      case "signal": {
        peer = createPeer(streamId, "viewer", (signalData) => {
          // Send a signal to the server
          ws.send(JSON.stringify({ viewer: true, type: "signal", streamId, viewerId, data: signalData }));
        });
      peer.signal(data.data);
      break;
      }
    }
  }
}

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
};

fetch(`/streams`)
  .then((response) => response.json())
  .then((data) => {
    const streams = data.streams;
    const streamList = document.getElementById("streamList");
    streams.forEach((streamId) => {
      const li = document.createElement("li");
      li.textContent = streamId;
      streamList.appendChild(li);
    });
  });
