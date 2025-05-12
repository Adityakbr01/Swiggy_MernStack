// socket.ts
import { io } from "socket.io-client";

const socket = io("https://swiggy-mernstack.onrender.com/",{
    autoConnect: true,
  reconnection: true,
}); // replace with your backend URL
export default socket;
