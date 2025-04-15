import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import { shuffle } from "./fun.js";

const httpServer = createServer();
const io = new Server(httpServer);

dotenv.config();

const PORT = process.env.PORT;

const colors = ["red", "yellow", "green", "blue"];

const specialCards = ["skip", "reverse", "draw2"];

const wildCards = [
  { color: "black", value: "wild", type: "wild" },
  { color: "black", value: "wild draw4", type: "wild" },
];

const unoDeck = [];

colors.forEach((color) => {
  unoDeck.push({ color, value: 0, type: "number" });
  for (let i = 1; i <= 9; i++) {
    unoDeck.push({ color, value: i, type: "number" });
    unoDeck.push({ color, value: i, type: "number" });
  }
  specialCards.forEach((action) => {
    unoDeck.push({ color, value: action, type: "special" });
    unoDeck.push({ color, value: action, type: "special" });
  });
});

for (let i = 0; i < 4; i++) {
  wildCards.forEach((wild) => {
    unoDeck.push({ ...wild });
  });
}

const players = [];

const cardCount = 12;

let gameStarted = false;
let playCards = {};
let firstCard = null;

io.on("connection", (socket) => {
  players.push({ id: socket.id });
  console.log(`socket ${socket.id} connected`);
  console.log(`Players connected: ${players.length}`);

  socket.emit("send", "Welcome to the UNO game!");

  if (players.length === 4 && !gameStarted) {
    gameStarted = true;

    const shuffledDeck = shuffle([...unoDeck]);

    playCards = {};
    players.forEach((player) => {
      const hand = shuffledDeck.splice(0, cardCount);
      playCards[player.id] = hand;
    });

    while (shuffledDeck.length > 0) {
      const card = shuffledDeck.shift();
      if (card.type === "number") {
        firstCard = card;
        break;
      } else {
        shuffledDeck.push(card);
      }
    }

    socket.emit("shuffled_card", playCards);

    socket.emit("first_card", firstCard);
  }

  socket.on("message", (msg) => {
    console.log(`Message from ${socket.id}: ${msg}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
    // Clean up
    const index = players.findIndex((p) => p.id === socket.id);
    if (index !== -1) players.splice(index, 1);

    if (players.length < 4) {
      gameStarted = false;
      playCards = {};
      firstCard = null;
      console.log("Game reset due to player disconnect");
    }
  });
});
httpServer.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
});
