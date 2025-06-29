import { messageTypes } from "../constants";
import "../style.css";
import { game } from "./game";
import { sendMessage } from "./websocket";
import "./keyboardControl"
import "./mouseControl"

document.querySelector(".close-button").addEventListener("click", () => {
  const modal = document.querySelector("#game-over-panel");
  const message = document.querySelector(".modal-message");
  if (modal) {
    modal.style.display = "none";
  }
  if(message){
    message.textContent = "";
  }

});

document.querySelector(".set-name-button").addEventListener("click", () => {  
   const input  = document.querySelector(".imput-name");
    const name = input.value.trim();
    if(name.length > 0) {
      game.playerName = name;
      sendMessage(JSON.stringify({
        type: messageTypes.SET_NAME,
        name: game.playerName,
      }));
    }
});

game.start();
