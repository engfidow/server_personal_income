const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const emailRoutes = require("./routes/emailRoutes");
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.use("/api/categories", categoryRoutes);


app.use("/api", emailRoutes);





module.exports = app;
