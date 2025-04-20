import app from "server";
import dotenv from "dotenv";
import http from 'http';
import { Server } from 'socket.io';
import connectDB from "@/db/db";

dotenv.config();

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);


export const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  server.listen(PORT, () => {
    connectDB();
    console.log(`Server running`);
  });