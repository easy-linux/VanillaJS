const peers = [];

const createPeer = (streamId, role, signalHandler) => {
  const peer = new SimplePeer({
    initiator: role === 'streamer',
    trickle: false,
  });

  peer.on('signal', (data) => {
    signalHandler(data);
  });

  peer.on('stream', (stream) => {
    if (role === 'viewer') {
      const video = document.getElementById('video');
      video.srcObject = stream;
    }
  });

  peer.on('error', (err) => {
    console.error('Peer Error:', err);
  });
  peers.push(peer);
  return peer;
};

export { createPeer };