import { game } from "./game"


export const renderFood = () => {
    const ctx = game.ctx;
    const food = game.food;
    const offsetX = game.offsetX;
    const offsetY = game.offsetY;   


    food.forEach((f) => {
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(f.x - offsetX, f.y - offsetY, f.size, 0, Math.PI * 2);
        ctx.fill();
    });
}