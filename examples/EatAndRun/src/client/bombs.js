import { game } from "./game"


export const renderBombs = () => {
    const ctx = game.ctx;
    const bombs = game.bombs;
    const offsetX = game.offsetX;
    const offsetY = game.offsetY;   


    bombs.forEach((f) => {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(f.x - offsetX, f.y - offsetY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}