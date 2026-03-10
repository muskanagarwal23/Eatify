const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/errorHandler");
const {apiLimiter} = require("./middleware/rateLimiter");
const helmet = require("helmet");

const app = express();

app.use("/api/webhooks", require("./routes/webhookRoutes"));

app.use(express.json());
app.use(cors());

app.use(errorHandler);
app.use("/api", apiLimiter);
app.use(helmet());

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/protected", require("./routes/protectedRoutes"))

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/vendor", require("./routes/vendorRoute"));

app.use("/api/menu",require("./routes/menuRoutes"));

app.use("/api/public", require("./routes/publicRoutes"));

app.use("/api/cart", require("./routes/cartRoutes"));

app.use("/api/orders", require("./routes/orderRoutes"));

app.use("/api/delivery", require("./routes/deliveryRoutes"));

app.use("/api/payments", require("./routes/paymentRoutes"));


module.exports = app;
