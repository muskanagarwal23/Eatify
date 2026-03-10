const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  // 🔐 Authenticate socket using JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("No token"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
  const { userId, role } = socket.user;

  console.log(`🔌 ${role} connected: ${userId}`);

  // personal room
  socket.join(`user:${userId}`);

  // role room
  socket.join(`role:${role}`);

  socket.on("joinOrder", (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`📦 Joined order room: ${orderId}`);
  });

  // ⭐ TEST EVENT
  setTimeout(() => {
    socket.emit("testEvent", {
      message: "Realtime working 🚀"
    });
  }, 2000);

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${userId}`);
  });
});
  
};

// used later inside controllers
exports.getIO = () => io;