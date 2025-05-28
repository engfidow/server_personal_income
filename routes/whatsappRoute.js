const express = require("express");
const { sendWhatsAppMessage } = require("./whatsapp");
const router = express.Router();


router.post("/notify-low-income", sendWhatsAppMessage);

module.exports = router;
