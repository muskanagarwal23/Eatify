require("dotenv").config();
const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const {initSocket} = require("./socket");
initSocket(server);


const connectDB = require("./config/db");


connectDB();

const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log("Server is running on port 5000");
  
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);

  server.close(() => process.exit(1));
});
