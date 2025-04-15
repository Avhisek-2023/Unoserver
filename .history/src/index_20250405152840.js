import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

const httpServer = createServer();
const io = new WebSocketServer(httpServer);

dotenv.config();

const PORT = process.env.PORT;

console.log(PORT);

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);

  // upon disconnection
  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
