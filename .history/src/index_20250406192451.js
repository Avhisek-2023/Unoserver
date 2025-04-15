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

const shuffledDeck = shuffle(unoDeck);

const playersCards = shuffledDeck.splice(0, 48);
const remainingDeck = shuffledDeck;
// console.log(playersCards.length, remainingDeck.length);

io.on("connection", (socket) => {
  console.log(io.engine.clientsCount);
  console.log(`socket ${socket.id} connected`);

  socket.emit("send", "hello msg");

  socket.emit("shuffled_card", {});

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port: http://localhost:${PORT}`);
});
