import { messageTypes } from "../constants";
import { sendMessage } from "./websocket";


let vx = 0;
let vy = 0;

document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowUp') vy = -2;
    if(e.key === 'ArrowDown') vy = 2;
    if(e.key === 'ArrowLeft') vx = -2;
    if(e.key === 'ArrowRight') vx = 2;

    sendMessage(JSON.stringify({type: messageTypes.MOVE, vx, vy}))
});

document.addEventListener('keyup', (e) => {
    if(e.key === 'ArrowUp') vy = 0;
    if(e.key === 'ArrowDown') vy = 0;
    if(e.key === 'ArrowLeft') vx = 0;
    if(e.key === 'ArrowRight') vx = 0;

    sendMessage(JSON.stringify({type: messageTypes.MOVE, vx, vy}))
});