import { renderBombs } from "./bombs";
import { renderFood } from "./food";
import { renderLeadersBoard } from "./leadersBoard";
import { renderMap } from "./map";
import { renderPlayers } from "./players";
import { initWS } from "./websocket";

class Game {
  #playerId = null;
  #playerName = "UnNammed";
  #players = [];
  #bombs = [];
  #food = [];
  #me = { x: 0, y: 0, size: 10 };
  #leaderBoard = [];
  #offsetX = 0;
  #offsetY = 0;

  #animationFrameId = null;
  #canvas = document.getElementById("game");
  #ctx = this.#canvas.getContext("2d");

  constructor() {
    this.render = this.render.bind(this);
  }

  get canvas() {
    return this.#canvas;
  }
  get ctx() {
    return this.#ctx;
  }
  get playerId() {
    return this.#playerId;
  }
  set playerId(id) {
    this.#playerId = id;
  }
  get playerName() {
    return this.#playerName;
  }
  set playerName(name) {
    this.#playerName = name;
  }
  get players() {
    return this.#players;
  }
  set players(players) {
    this.#players = players;
    this.#me = this.#players.find((p) => p.id === this.#playerId);
  }
  get food() {
    return this.#food;
  }
  set food(food) {
    this.#food = food;
  }
  get bombs() {
    return this.#bombs;
  }
  set bombs(bombs) {
    this.#bombs = bombs;
  }
  get me() {
    return this.#me;
  }
  set me(me) {
    this.#me = me;
  }
  get leaderBoard() {
    return this.#leaderBoard;
  }
  set leaderBoard(leaderBoard) {
    this.#leaderBoard = leaderBoard;
  }
  get offsetX() {
    return this.#offsetX;
  }
  set offsetX(offsetX) {
    this.#offsetX = offsetX;
  }
  get offsetY() {
    return this.#offsetY;
  }
  set offsetY(offsetY) {
    this.#offsetY = offsetY;
  }

  start() {
    initWS({
      playerName: this.#playerName,
      onInit: (id) => {
        this.playerId = id;
      },
      onUpdate: (msg) => {
        this.players = msg.players;
        this.food = msg.food;
        this.bombs = msg.bombs;
        this.leaderBoard = msg.leaderBoard;
      },
      onClose: () => {
        this.stop();
      },
      onGameOver: (msg) => {
        const message = document.querySelector(".modal-message");
        const modal = document.querySelector("#game-over-panel");
        if (message) {
          message.textContent = msg.message || "Game Over!";
        }
        if (modal) {
          modal.style.display = "flex";
        }
      },
    });

    this.render();
  }

  render() {
    this.offsetX = this.#me.x - this.canvas.width / 2;
    this.offsetY = this.#me.y - this.canvas.height / 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    renderPlayers();
    renderFood();
    renderMap();
    renderLeadersBoard();
    renderBombs();

    this.#animationFrameId = requestAnimationFrame(() => this.render());
  }

  stop() {
    if (this.#animationFrameId) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }
  }
}

export const game = new Game();
