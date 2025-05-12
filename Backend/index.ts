import app from "server";
import dotenv from "dotenv";
import http from 'http';
import { Server } from 'socket.io';
import connectDB from "@/db/db";

dotenv.config();

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

if(!process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN is not defined');
}

export const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  server.listen(PORT, () => {
    connectDB();
    console.log(`Server running`);
  });

  // Socket event listener
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  // Listen for joinRoom event
  socket.on('joinRoom', ({ userId, restaurantId, riderId }) => {

    console.log('joinRoom event received:', { userId, restaurantId, riderId });

    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`✅ User joined room: user_${userId}`);
    }

    if (restaurantId) {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`✅ Restaurant joined room: restaurant_${restaurantId}`);
    }

    if (riderId) {
      socket.join(`rider_${riderId}`);
      console.log(`✅ Rider joined room: rider_${riderId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔥 Client disconnected:', socket.id);
  });
});