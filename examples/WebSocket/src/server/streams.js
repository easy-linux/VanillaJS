import { parseServerMessage } from "./utils.js";
import { appConstants } from "../common/constants.js";
import { sendToSocket } from "../common/utils.js";

const streams = new Map(); // {id, stream, name}

export const removeStream = (id) => {
  if (streams.has(id)) {
    const user = streams.get(id);
    streams.delete(id);
  }
};

const sendUsersToAll = () => {
    const users = [...streams.values()].filter((user) => !!user.name).map((user) => ({ id: user.id, name: user.name }));
    [...streams.values()].forEach((user) => {
        sendToSocket(user.socket, {
            type: appConstants.message.type.usersList, 
            users,
        })
    })    
}

export const setName = (id, name) => {
  if (streams.has(id)) {
    const user = streams.get(id);
    user.name = name;
    streams.set(id, user);
    sendUsersToAll();
  }
};

export const addStream = (id, socket) => {
  const authorId = id;
  socket.on("close", () => {
    removeStream(id);
    sendUsersToAll();
  });

  socket.on("message", (message) => {
    const data = parseServerMessage(message);
    if (data) {
      try {
        switch (data.type) {
          case appConstants.message.type.setName: {
            const { id, name } = data;
            if (id && name) {
              setName(id, name);
            }
            break;
          }
          case appConstants.message.type.getUsers: {
            const users = [...streams.values()].filter((user) => !!user.name).map((user) => ({ id: user.id, name: user.name }));
            sendToSocket(socket, {
              type: appConstants.message.type.usersList,
              users,
            });
            break;
          }
          case appConstants.message.type.sendMessage: {
            const { id, message, messageId } = data;
            if (streams.has(id)) {
              const user = streams.get(id);
              const author = streams.get(authorId);
              if (user && author) {
                sendToSocket(user.socket, {
                  ...data,
                  authorId,
                  authorName: author.name,
                });
              }
            }
            break;
          }
          case appConstants.message.type.messageDelivered: {
            const { id } = data;
            if (streams.has(id)) {
              const user = streams.get(id);
              const author = streams.get(authorId);
              if (user && author) {
                sendToSocket(user.socket, data);
              }
            }
          }
          case appConstants.message.type.publicMessage: {
            const author = streams.get(authorId);
            if (author) {
              [...streams.values()].forEach((user) => {
                sendToSocket(user.socket, {
                  ...data,
                  authorId,
                  authorName: author.name,
                });
              });
            }
            break;
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

  streams.set(id, { id, socket, name: "" });

  sendUsersToAll();
};
