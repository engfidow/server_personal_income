const nodemailer = require("nodemailer");
require("dotenv").config();

exports.notifyLowIncome = async (req, res) => {
  const { email, income } = req.body;
  console.log("Target Email:", email);
  console.log("Current Income:", income);

  if (!email || income === undefined) {
    return res.status(400).json({ message: "Missing email or income" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Optional: Test transporter
    await transporter.verify();
    console.log("SMTP Server is ready");

    await transporter.sendMail({
      from: `"Finance App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "⚠️ Low Income Alert",
      html: `<p>Hello,</p><p>Your total income is <strong>$${income}</strong>, which is below the safe threshold.</p><p>Please review your budget and plan accordingly.</p>`,
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};
