import { server } from "./library/socket.js";

const port = process.env.PORT || 8009;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
