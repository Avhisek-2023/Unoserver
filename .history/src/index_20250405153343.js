import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";

const httpServer = createServer();
const io = new Server(httpServer);

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

httpServer.listen(PORT);
