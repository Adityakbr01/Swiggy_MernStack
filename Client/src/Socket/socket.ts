// socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5000",{
    autoConnect: true,
  reconnection: true,
}); // replace with your backend URL
export default socket;
