import { FIELD_SIZE, MAP_SIZE } from "../constants";
import { getBombs } from "../server/bombs";
import { game } from "./game"


export const renderMap = () => {
    const ctx = game.ctx;
    const canvas = game.canvas;

    const currPlayerId = game.playerId;
    const players = game.players;

    const bombs = game.bombs;

    const mapX = canvas.width - MAP_SIZE - 10;
    const mapY = canvas.height - MAP_SIZE - 10;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(mapX, mapY, MAP_SIZE, MAP_SIZE);

    players.forEach((player) => {
        const dotX = mapX + (player.x / FIELD_SIZE) * MAP_SIZE;
        const dotY = mapY + (player.y / FIELD_SIZE) * MAP_SIZE;
        ctx.fillStyle = player.id === currPlayerId ? 'white' : 'yellow';
        ctx.fillRect(dotX, dotY, 3, 3);
    });

    bombs.forEach((bomb) => {
        const dotX = mapX + (bomb.x / FIELD_SIZE) * MAP_SIZE;
        const dotY = mapY + (bomb.y / FIELD_SIZE) * MAP_SIZE;
        ctx.fillStyle = 'red';
        ctx.fillRect(dotX, dotY, 3, 3);
    });

}