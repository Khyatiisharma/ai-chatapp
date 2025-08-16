import http from "http";
import app from "./index.js";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(5000, () => {
  console.log(`Server is running on port ${PORT}`);
});
