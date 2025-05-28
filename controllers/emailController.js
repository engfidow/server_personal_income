const nodemailer = require("nodemailer");

exports.notifyLowIncome = async (req, res) => {
  const { email, income } = req.body;

  if (!email || income === undefined) {
    return res.status(400).json({ message: "Missing email or income" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,     // your Gmail address
        pass: process.env.EMAIL_PASS      // app password, not your normal Gmail password
      },
    });

    await transporter.sendMail({
      from: `"Finance App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "⚠️ Low Income Alert",
      html: `<p>Hello,</p><p>Your total income is currently <strong>$${income}</strong>, which is below the minimum threshold.</p><p>Please take action accordingly.</p>`
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};
 