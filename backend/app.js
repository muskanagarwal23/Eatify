const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/protected", require("./routes/protectedRoutes"))

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/vendor", require("./routes/vendorRoute"));

app.use("/api/menu",require("./routes/menuRoutes"));

module.exports = app;
