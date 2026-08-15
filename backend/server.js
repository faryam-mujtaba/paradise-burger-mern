const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminReportRoutes = require("./routes/adminReportRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dealRoutes = require("./routes/dealRoutes");
const shopRoutes = require("./routes/shopRoutes");
const profileRoutes = require("./routes/profileRoutes");
const sendEmail = require("./utils/sendEmail");
connectDB();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/shop", shopRoutes);

app.get("/", (req, res) => {
  res.send("Paradise Burger API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server is running on port ${PORT}`);

  const emailReady = await sendEmail.verifyConnection();

  if (!emailReady) {
    console.log(
      "Email service is not ready. Check EMAIL_USER and EMAIL_PASS in .env."
    );
  }
});