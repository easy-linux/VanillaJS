import { game } from "./game"


export const renderPlayers = () => {
    const ctx = game.ctx;
    const currPlayerId = game.playerId;

    const players = game.players;
    const offsetX = game.offsetX;
    const offsetY = game.offsetY;

    players.forEach((p) => {
       ctx.fillStyle = p.id === currPlayerId ? "blue" : "red";
       ctx.beginPath();
       ctx.arc(p.x - offsetX, p.y - offsetY, p.size, 0, Math.PI * 2);
       ctx.fill();

       ctx.fillStyle = p.id === currPlayerId ? "blue" : "red";
       ctx.font  = '12px Arial';
       ctx.textAlign = 'center';
       ctx.fillText(p.name, p.x - offsetX, p.y - offsetY - p.size - 5 );
    })
}