const db = require("../models/db");

// Add new transaction
exports.addTransaction = async (req, res) => {
  try {
    const {user_id, type, category, amount, note, date } = req.body;

    await db.query(
      "INSERT INTO transactions (user_id, type, category, amount, note, date) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, type, category, amount, note, date]
    );

    res.status(201).json({ message: "Transaction added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding transaction", error });
  }
};

// Get all transactions for the logged-in user
exports.getTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
      [req.params.userid]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {user_id, type, category, amount, note, date } = req.body;

    await db.query(
      "UPDATE transactions SET type = ?, category = ?, amount = ?, note = ?, date = ? WHERE id = ? AND user_id = ?",
      [type, category, amount, note, date, id, user_id]
    );

    res.json({ message: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction", error });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM transactions WHERE id = ? ", [
      id
    ]);

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error });
  }
};

// Generate report based on range: week, month, year, custom
exports.getReportRange = async (req, res) => {
  try {
    const { range, id } = req.params; // week | month | year | custom | all
    const { from: qFrom, to: qTo } = req.query;

    let query = "SELECT * FROM transactions WHERE user_id = ?";
    const params = [id]; // ✅ fix: make it an array

    if (range === "custom" && qFrom && qTo) {
      query += " AND date BETWEEN ? AND ?";
      params.push(qFrom, qTo);
    } else if (range === "week" || range === "month" || range === "year") {
      const today = new Date();
      let from, to = today;

      if (range === "week") {
        from = new Date(today);
        from.setDate(today.getDate() - 6);
      } else if (range === "month") {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
      } else if (range === "year") {
        from = new Date(today.getFullYear(), 0, 1);
      }

      const fromStr = from.toISOString().split("T")[0];
      const toStr = to.toISOString().split("T")[0];

      query += " AND date BETWEEN ? AND ?";
      params.push(fromStr, toStr);
    } else if (range !== "all") {
      return res.status(400).json({ message: "Invalid range type" });
    }

    query += " ORDER BY date ASC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("❌ Report Error:", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};


exports.getDashboardData = async (req, res) => {
  const userId = req.params.id;

  try {
    // Total income
    const [[incomeRow]] = await db.query(
      "SELECT SUM(amount) AS total_income FROM transactions WHERE user_id = ? AND type = 'income'",
      [userId]
    );

    // Total expenses
    const [[expenseRow]] = await db.query(
      "SELECT SUM(amount) AS total_expense FROM transactions WHERE user_id = ? AND type = 'expense'",
      [userId]
    );

    // Recent transactions
    const [recentTransactions] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 5",
      [userId]
    );

    // Monthly income & expense (last 6 months)
    const [monthlyChartData] = await db.query(
      `SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        type,
        SUM(amount) as total
      FROM transactions
      WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month, type
      ORDER BY month ASC`,
      [userId]
    );

    // Expense category breakdown
    const [categoryBreakdown] = await db.query(
      `SELECT category, SUM(amount) as total
       FROM transactions
       WHERE user_id = ? AND type = 'expense'
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    res.json({
      totalIncome: incomeRow.total_income || 0,
      totalExpense: expenseRow.total_expense || 0,
      balance: (incomeRow.total_income || 0) - (expenseRow.total_expense || 0),
      recentTransactions,
      monthlyChartData,
      categoryBreakdown
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err.message);
    res.status(500).json({ message: "Error loading dashboard data" });
  }
};



