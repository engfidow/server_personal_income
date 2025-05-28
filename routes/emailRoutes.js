const express = require("express");
const router = express.Router();
const { notifyLowIncome } = require("../controllers/emailController");

router.post("/notify-low-income", notifyLowIncome);

module.exports = router;
