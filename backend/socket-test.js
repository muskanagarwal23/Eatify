const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
  transports: ["websocket"], 
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTdlMWRkZTE2MzVlZDFjNzA4NzFkMzkiLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NzI5MDA2MDgsImV4cCI6MTc3MzUwNTQwOH0.d_N3rT3O2KffQkgeuqtF_F_MBrZxvbOBCBGwR16R3BI"
  }
});

socket.on("connect", () => {
  console.log("✅ Connected to socket");
  socket.emit("joinOrder", "69ac5152f7adf8ce8936e327");
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection error:", err.message);
});
  socket.on("testEvent", (data) => {
  console.log("📡 EVENT RECEIVED:", data);
  });

  socket.on("orderStatusUpdated", console.log);
socket.on("paymentUpdate", console.log);
socket.on("deliveryAssigned", console.log);
socket.on("deliveryStatusUpdated", console.log);
