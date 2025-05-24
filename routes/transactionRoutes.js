const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getReportRange,
  getDashboardData,
} = require("../controllers/transactionController");



// Protected Routes for logged-in users only
router.post("/", addTransaction);                 // Add a transaction
router.get("/:userid", getTransactions);                // Get all user transactions
router.put("/:id", updateTransaction);           // Update a transaction
router.delete("/:id", deleteTransaction);        // Delete a transaction

// Report route with range: week, month, year, or custom?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/:id/reports/:range", getReportRange);   // e.g. /reports/week or /reports/custom?from=...&to=...

// ✅ Dashboard route
router.get("/dashboard/:id", getDashboardData);

module.exports = router;
