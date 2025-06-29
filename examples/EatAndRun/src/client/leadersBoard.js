import { game } from "./game"


export const renderLeadersBoard = () => {
    const ctx = game.ctx;
    const leaderBoard = game.leaderBoard;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 200, (1 + leaderBoard.length) * 23);
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TOP 10', 100, 30);
    ctx.textAlign = 'left';
    leaderBoard.forEach((l, i) => {
        ctx.fillText(`${i+1}. ${l.name} (${l.size})`, 20, 50 + i * 20)
    })
}