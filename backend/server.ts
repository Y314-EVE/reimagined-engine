import dotenv from "dotenv";
import express from "express";
import { Server, Socket } from "socket.io";
import cors from "cors";
import rootRoute from "./routes/rootRoute";
import dbconnection from "./db/dbconnection";
import { JwtPayload } from "jsonwebtoken";

dotenv.config();
declare global {
  namespace Express {
    export interface Request {
      user: JwtPayload | string;
    }
  }
}
const app = express();
const PORT = process.env.PORT || 5000;
const DBURL = process.env.DBURL || "mongodb:://localhost:27017";

dbconnection(DBURL);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

rootRoute(app);

const expressServer = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

let socket: Socket;
const io = new Server(expressServer, {});

io.on("connection", (iosocket) => {
  socket = iosocket;
  console.log(`User ${socket.id} has connected`);
  socket.on("leave chat", (chat_id) => {
    socket.leave(chat_id);
    console.log(`User ${socket.id} has left chat ${chat_id}`);
  });
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} has disconnected`);
  });
});
export { io, socket };
