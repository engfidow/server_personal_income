const db = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const nodemailer = require("nodemailer");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    // simulate token and reset link (in production, use JWT or UUID)
    const token = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    await db.query("UPDATE users SET reset_token = ? WHERE email = ?", [token, email]);

    // send email using nodemailer (for testing use Mailtrap or Ethereal)
    const transporter = nodemailer.createTransport({
      service: "gmail", // or any SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Code",
      text: `Your reset code is: ${token}`,
    });

    res.json({ message: "Reset code sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Register User
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const image = req.file?.filename;

  const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (existing.length > 0) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  await db.query("INSERT INTO users (name, email, password, image) VALUES (?, ?, ?, ?)", [
    name,
    email,
    hashed,
    image,
  ]);

  res.status(201).json({ message: "User registered successfully" });
};

exports.verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  const [rows] = await db.query("SELECT * FROM users WHERE email = ? AND reset_token = ?", [email, code]);

  if (rows.length === 0) {
    return res.status(400).json({ message: "Invalid code or email" });
  }

  res.json({ message: "Code verified" });
};



exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const hashed = await bcrypt.hash(newPassword, 10);

  await db.query("UPDATE users SET password = ?, reset_token = NULL WHERE email = ?", [hashed, email]);

  res.json({ message: "Password reset successful" });
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  const user = users[0];
  if (!user) return res.status(400).json({ message: "Invalid email" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
  });
};

// Get user profile
exports.getUserInfo = async (req, res) => {
  const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (users.length === 0) return res.status(404).json({ message: "User not found" });
  res.json(users[0]);
};

// Update user profile
// Update user profile
exports.updateUserInfo = async (req, res) => {
  const { name, email, password } = req.body;
  const image = req.file?.filename;
  const userId = req.params.id; // ✅ use id from route param

  const updates = [];
  const values = [];

  if (name) {
    updates.push("name = ?");
    values.push(name);
  }

  if (email) {
    updates.push("email = ?");
    values.push(email);
  }

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    updates.push("password = ?");
    values.push(hashed);
  }

  if (image) {
    updates.push("image = ?");
    values.push(image);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  values.push(userId); // ✅ use param id
  const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

  try {
    await db.query(sql, values);
    res.json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({ message: "Failed to update user", error });
  }
};

