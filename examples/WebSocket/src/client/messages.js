import { appConstants } from "../common/constants";
import { generateUUID } from "../common/utils";
import { sendMessage } from "./websocket";

const chat = document.querySelector(".chat");
const messageToAllButton = document.querySelector(".message-button");
const messageInput = document.querySelector(".message-input");

export const addMessage = (prefix, message, messageId, delivered) => {
  const messageEl = document.createElement("div");
  messageEl.classList.add("chat-message");
  if (!delivered) {
    messageEl.classList.add("sending");
  }
  messageEl.innerHTML = `<div>${prefix}:</div><div>${message}</div>`;
  messageEl.dataset.messageId = messageId;
  chat.appendChild(messageEl);
  chat.scrollTop = chat.scrollHeight;
};

export const addDelivered = (messageId) => {
  const message = chat.querySelector(`[data-message-id='${messageId}']`);
  if (message) {
    message.classList.remove("sending");
  }
};

messageToAllButton.addEventListener("click", (e) => {
  const message = messageInput.value;
  const messageId = generateUUID();
  if (message) {
    sendMessage({
      type: appConstants.message.type.publicMessage,
      message,
      messageId,
    });
    addMessage("💚 to all", message, messageId, true);
  }
});
