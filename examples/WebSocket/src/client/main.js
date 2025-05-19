import { appConstants } from "../common/constants";
import { clientId } from "../common/utils";
import { addDelivered, addMessage } from "./messages";
import "./style.css";
import { addUser, clearUsers, getUser, refreshUsers } from "./usersList";
import { init, sendMessage } from "./websocket";

const id = clientId;

const nameInput = document.querySelector(".name-input");
const nameButton = document.querySelector(".name-button");

const handleMessage = (message) => {
  const data = JSON.parse(message);
  switch (data.type) {
    case appConstants.message.type.usersList: {
      const { users } = data;
      clearUsers();
      users.forEach((user) => {
        addUser(user.id, user);
      });
      refreshUsers();
      break;
    }
    case appConstants.message.type.sendMessage: {
      const { id, message, messageId, authorId, authorName } = data;
      const user = getUser(id);
      if (user) {
        const author = getUser(authorId);
        addMessage(`❤️ from ${author.name}`, message, messageId, true);
        sendMessage({
          id: authorId,
          type: appConstants.message.type.messageDelivered,
          messageId,
        });
      }
      break;
    }
    case appConstants.message.type.publicMessage: {
      const { message, messageId, authorId, authorName } = data;

      const author = getUser(authorId);
      addMessage(`❤️ ✳️ from ${author.name}`, message, messageId, true);
      break;
    }
    case appConstants.message.type.messageDelivered: {
        const {messageId} = data;
        addDelivered(messageId);
        break;
    }
  }
};

const onOpen = () => {};
const onMessage = async (event) => {
  if (event.data instanceof Blob) {
    const blobData = await event.data.text();
    handleMessage(blobData);
  } else {
    handleMessage(event.data);
  }
};
const onClose = () => {};
const onError = () => {};

init(id, { onOpen, onMessage, onError, onClose });

nameButton.addEventListener('click', () => {
    const name = nameInput.value;
    sendMessage({
        id, 
        type: appConstants.message.type.setName,
        name,
    })
})
