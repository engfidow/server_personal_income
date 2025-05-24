const app = require("./app");
const dotenv = require("dotenv");
const db = require("./models/db");
const initDB = require("./models/initDB");

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("✅ MySQL database connected successfully.");

    await initDB(); // Create tables if they don't exist

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MySQL database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
