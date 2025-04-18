import { server } from "./library/socket.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
