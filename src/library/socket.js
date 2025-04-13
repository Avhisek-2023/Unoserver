import { Server } from "socket.io";
import express from "express";
import http from "http";
import unoDeck from "./fun.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const players = [];

const cardCount = 12;

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  players.push({ id: socket.id });

  const playerData = [];
  let gameStarted = false;
  let firstCard = null;

  if (players.length === 4) {
    gameStarted = true;
    players.forEach((player) => {
      const hand = unoDeck.splice(0, cardCount);
      playerData[player.id] = { hand: hand };
      io.to(player.id).emit("shuffled_card", hand);
      console.log(`Card for ${player.id}:`, hand);
    });
  }
  if (gameStarted === true) {
    while (unoDeck.length > 0) {
      const card = unoDeck.shift();
      if (card.type === "number") {
        firstCard = card;
        break;
      } else {
        unoDeck.push(card);
      }
    }
    io.emit("first_card", firstCard);
    gameStarted = false;
  }

  socket.emit("send", "hello msg");

  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

export { io, app, server };
