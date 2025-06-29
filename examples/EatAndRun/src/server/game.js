import { MAX_PLAYER_SIZE, messageTypes, ROUND_TIME } from "../constants.js";
import { getBombs, restartBombs } from "./bombs.js";
import { getBots, getBotsSnapshot, restartBots } from "./bots.js";
import { addFood, restartFood, getFood } from "./food.js";
import { getPlayers, broadcastGameOver, broadcastMessage, getPlayersSnapshot, restartPlayers } from "./players.js";

let gameOver = false;
let roundStart = Date.now();

export const startGame = () => {
  restartFood();
  restartBots();
  restartBombs();
};

export const restartGame = () => {
    restartPlayers();
    restartFood();
    restartBots();
    restartBombs();
    gameOver = false;
    roundStart = Date.now();
    const message = {
        type: messageTypes.GAME_RESTARTED,
    };
    broadcastMessage(message);
}

export const gameLoop = () => {
    if (gameOver) {
        const timePassed = Date.now() - roundStart;
        if (timePassed >= 10000) {
            restartGame();
        }
        return;
    };

    const players = getPlayers()
    const bots = getBots();

    addFood();
    const payersSnapshot = getPlayersSnapshot();
    const botsSnapshot = getBotsSnapshot();
    const food = getFood();
    const bombs = getBombs();

    const leaderBoard = [...players, ...bots]
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map(player => ({   
        id: player.id,
        name: player.name || 'UnNammed',
        size: player.size.toFixed(1),
    }));
    
    const update = {
        type: messageTypes.GAME_UPDATE,
        players: [...payersSnapshot, ...botsSnapshot],
        food,
        leaderBoard,
        bombs,
    };
    broadcastMessage(update);

    if(!gameOver){
        const alivePlayers = players.filter(player => player.size > 0);
        const leader = [...players, ...bots]
        .reduce((max, player) => {
            return player.size > max.size ? player : max;
        }, { size: 0 });

        const timePassed = Date.now() - roundStart;

        if(alivePlayers.length === 1 && players.length > 1) {
            gameOver = true;
            broadcastGameOver(`Game Over! ${alivePlayers[0].name} won!`);
        } else if(leader.size >= MAX_PLAYER_SIZE ) {
            gameOver = true;
            broadcastGameOver(`Game Over! ${leader.name} won!`);
        } else if (timePassed >= ROUND_TIME) { // 5 minutes
            gameOver = true;
            broadcastGameOver(`Game Over! Time's up! The winner is ${leader.name}!`);
        }

    }

}
