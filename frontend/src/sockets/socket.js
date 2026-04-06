import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  console.log("🔥 TOKEN IN SOCKET:", token);
  socket = io("http://localhost:5000", {
    auth: {
      token,
    },
  });
   socket.on("connect", () => {
    console.log("✅ SOCKET CONNECTED");
  });

  socket.on("connect_error", (err) => {
    console.log("❌ SOCKET ERROR:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;