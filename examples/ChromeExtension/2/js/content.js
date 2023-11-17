let timeout;
let lastClipboardData = "";
let noCheckClipboard = false;

const readClipboard = async () => {
  const result = await navigator.clipboard.readText();
  return result;
};

const writeClipboard = async (text) => {
  noCheckClipboard = true;
  lastClipboardData = text;
  await navigator.clipboard.writeText(text);
  noCheckClipboard = false;
  if (Toastify) {
    Toastify({
      text: "Текст обработан",
      duration: 3000,
      gravity: "bottom",
      position: "center",
    }).showToast();
  }
};

const onClipboardChanged = (text) => {
  writeClipboard(`<div>${text}</div>`);
};

function checkClipboard() {
  if(document.hasFocus()){
    navigator.clipboard.readText().then((clipboardData) => {
      if (!noCheckClipboard) {
        if (clipboardData !== lastClipboardData) {
          lastClipboardData = clipboardData;
          onClipboardChanged(clipboardData);
        }
      } else {
        console.log("noCheckClipboard", noCheckClipboard);
      }
    });
  } 
}
const startHandleClipboard = () => {
  navigator.clipboard.readText().then((text) => {
    lastClipboardData = text;
    timeout = setInterval(checkClipboard, 100);
  });
};

const stopHandleClipboard = () => {
  clearInterval(timeout);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "enable": {
      if (request.value) {
        startHandleClipboard();
      } else {
        stopHandleClipboard();
      }
      sendResponse({ ok: true });
      return;
    }
    case "copy": {
      const text = request.text;
      onClipboardChanged(text);
      sendResponse({ ok: true });
      return;
    }
  }
  sendResponse({ ok: true });
});

chrome.runtime.sendMessage({ type: "status" }, (res) => {
  if (res?.active) {
    startHandleClipboard();
  } else {
    stopHandleClipboard();
  }
});
