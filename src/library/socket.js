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
const playerCard = {};
let playerData = {};
let firstCard = null;
let currentTurnIndex = 0;
let lastCardPlayed = null;

const nextTurn = () => {
  const currentPlayer = players[currentTurnIndex];
  const currentPlayerId = currentPlayer.id;
  const currentHand = playerData[currentPlayerId].hand;

  const playableCards = currentHand.filter((card) => {
    return (
      card.color === lastCardPlayed.color || card.value === lastCardPlayed.value
    );
  });

  io.emit("turn_change", { currentPlayerId });

  io.to(currentPlayerId).emit("your_turn", {
    playableCards,
    fullHand: currentHand,
    topCard: lastCardPlayed,
  });
};

io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);
  players.push({ id: socket.id });
  playerCard[socket.id] = 12;

  if (players.length === 4) {
    players.forEach((player) => {
      const hand = unoDeck.splice(0, cardCount);
      playerData[player.id] = { hand };
      io.to(player.id).emit("shuffled_card", hand);
      console.log(`Card for ${player.id}:`, hand);
    });

    while (unoDeck.length > 0) {
      const card = unoDeck.shift();
      if (card.type === "number") {
        firstCard = card;
        lastCardPlayed = card;
        break;
      } else {
        unoDeck.push(card);
      }
    }
    io.emit("card_count", playerCard);
    io.emit("first_card", firstCard);

    nextTurn();
  }

  socket.on("play_card", (cardPlayed) => {
    const playerId = socket.id;
    const hand = playerData[playerId].hand;

    const index = hand.findIndex(
      (card) =>
        card.color === cardPlayed.color && card.value === cardPlayed.value
    );

    if (index === -1) return;

    hand.splice(index, 1);
    lastCardPlayed = cardPlayed;

    playerCard[playerId] = playerCard[playerId] - 1;
    io.emit("card_played", { playerId, card: cardPlayed });
    io.emit("card_count", playerCard);
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    nextTurn();
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

export { io, app, server };
