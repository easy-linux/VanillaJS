import { appConstants } from "../common/constants";
import { sendToSocket } from "../common/utils";

let ws;

export const init = (id, {onOpen, onMessage, onError, onClose}) => {
    ws = new WebSocket(`ws://${appConstants.wsAddress}/ws?id=${id}`);

    ws.addEventListener('open', onOpen);
    ws.addEventListener('message', onMessage);
    ws.addEventListener('close', onClose);
    ws.addEventListener('error', onError);
}

export const sendMessage = (message) => {
   sendToSocket(ws, message);
}