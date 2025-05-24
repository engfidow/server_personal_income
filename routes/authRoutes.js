const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");


const {
  register,
  login,
  getUserInfo,
  updateUserInfo,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.get("/me/:id", getUserInfo);
router.put("/:id", upload.single("image"), updateUserInfo);

router.post("/forgot-password", forgotPassword);

router.post("/verify-code", verifyResetCode);
router.post("/reset-password", resetPassword);




module.exports = router;
