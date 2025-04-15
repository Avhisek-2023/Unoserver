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
      card.color === lastCardPlayed.color ||
      card.value === lastCardPlayed.value ||
      card.type === "wild"
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

    const index = hand.findIndex((card) => {
      if (card.type === "wild" || card.type === "wild draw4") {
        return card.type === cardPlayed.type && card.value === cardPlayed.value;
      }
      return (
        card.color === cardPlayed.color &&
        card.value === cardPlayed.value &&
        card.type === cardPlayed.type
      );
    });

    if (index === -1) return;

    hand.splice(index, 1);
    lastCardPlayed = cardPlayed;
    playerCard[playerId]--;

    io.emit("card_played", { playerId, card: cardPlayed });
    io.emit("card_count", playerCard);

    const nextPlayerIndex = (currentTurnIndex + 1) % players.length;
    const nextPlayer = players[nextPlayerIndex];
    const nextPlayerId = nextPlayer.id;

    switch (cardPlayed.value) {
      case "skip":
        currentTurnIndex = (currentTurnIndex + 2) % players.length;
        break;
      case "reverse":
        players.reverse();
        currentTurnIndex = (players.length - currentTurnIndex) % players.length;
        break;
      case "draw2":
        if (unoDeck.length >= 2) {
          const drawTwo = unoDeck.splice(0, 2);
          playerData[nextPlayerId].hand.push(...drawTwo);
          playerCard[nextPlayerId] += 2;
          io.to(nextPlayerId).emit("draw_card", drawTwo);
        }
        currentTurnIndex = (currentTurnIndex + 2) % players.length;
        break;
      case "wild draw4":
        if (unoDeck.length >= 4) {
          const drawFour = unoDeck.splice(0, 4);
          playerData[nextPlayerId].hand.push(...drawFour);
          playerCard[nextPlayerId] += 4;
          io.to(nextPlayerId).emit("draw_card", drawFour);
        }
        currentTurnIndex = (currentTurnIndex + 2) % players.length;
        break;
      case "wild":
        currentTurnIndex = (currentTurnIndex + 1) % players.length;
        break;
      default:
        currentTurnIndex = (currentTurnIndex + 1) % players.length;
    }

    nextTurn();
  });

  socket.on("set_color", ({ card, color }) => {
    if (card.type !== "wild") return;

    const playerId = socket.id;
    const hand = playerData[playerId].hand;

    const index = hand.findIndex(
      (c) => c.type === card.type && c.value === card.value
    );

    if (index === -1) return;

    hand.splice(index, 1);
    card.color = color;
    lastCardPlayed = card;
    playerCard[playerId]--;

    io.emit("card_played", { playerId, card });
    io.emit("card_count", playerCard);

    const nextPlayerIndex = (currentTurnIndex + 1) % players.length;
    const nextPlayerId = players[nextPlayerIndex].id;

    if (card.value === "wild draw4") {
      const drawFour = unoDeck.splice(0, 4);
      playerData[nextPlayerId].hand.push(...drawFour);
      playerCard[nextPlayerId] += 4;
      io.to(nextPlayerId).emit("draw_card", drawFour);
      currentTurnIndex = (currentTurnIndex + 2) % players.length;
    } else {
      currentTurnIndex = (currentTurnIndex + 1) % players.length;
    }

    nextTurn();
  });

  socket.on("take_card", () => {
    const playerId = socket.id;

    if (!playerData[playerId]) return;

    const draw = unoDeck.splice(0, 1);

    if (draw.length > 0) {
      playerData[playerId].hand.push(...draw);
      playerCard[playerId]++;
      io.to(playerId).emit("draw_card", draw);
      io.emit("card_count", playerCard);
      currentTurnIndex = (currentTurnIndex + 1) % players.length;
      nextTurn();
    }
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

export { io, app, server };
