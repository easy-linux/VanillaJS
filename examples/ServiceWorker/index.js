const onWorkerReady = () => {
    console.log('SW is ready');
}


navigator.serviceWorker.register('sw.js');
  
navigator.serviceWorker.ready.then(onWorkerReady);
