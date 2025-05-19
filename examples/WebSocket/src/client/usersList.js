import { appConstants } from "../common/constants";
import { generateUUID } from "../common/utils";
import { sendMessage } from "./websocket";

const userList = new Map();

const userListContainer = document.querySelector(".users-list");
const messageInput = document.querySelector(".message-input");

export const refreshUsers = () => {
  userListContainer.innerHTML = "";
  [...userList.values()].forEach((user) => {
    const div = document.createElement("div");
    div.className = "user-row";
    div.innerHTML = `<div>${user.name}</div>
        <button class="send-button"
            data-id="${user.id}"
            data-name="${user.name}"
            data-type="${appConstants.button.type.sendMessage}"
        >⬆️</button>`;
    userListContainer.appendChild(div);
  });
};

export const addUser = (id, user) => {
  userList.set(id, user);
};

export const getUser = (id) => {
  if (userList.has(id)) {
    return userList.get(id);
  }
  return null;
};

export const removeUser = (id) => {
  if (userList.has(id)) {
    return userList.delete(id);
  }
};

export const setName = (id, name) => {
  if (userList.has(id)) {
    const user = getUser(id);
    user.name = name;
    userList.set(id, user);
  }
};

export const clearUsers = () => {
  return userList.clear();
};

userListContainer.addEventListener('click', (e) => {
    const target = e.target;

    if(target.dataset.id){
        const idUser = target.dataset.id;
        const op = target.dataset.type;
        switch(op){
            case appConstants.message.type.sendMessage: {
                const message = messageInput.value;
                const messageId = generateUUID();
                sendMessage({
                    type: appConstants.message.type.sendMessage,
                    id: idUser,
                    message,
                    messageId,
                });
                addMessage(`💚 to ${target.dataset.name}`, message, messageId);
                break;
            }
        }
    }
})
