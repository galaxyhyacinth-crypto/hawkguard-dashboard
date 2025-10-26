import express from "express";
import nodemailer from "nodemailer";
const router = express.Router();

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  // semak email ada di database
  const userExists = true; // ganti dengan query sebenar
  if (!userExists) return res.status(400).json({ error: "Email not registered" });

  const resetToken = Math.random().toString(36).substring(2, 12); // token ringkas
  // simpan token ni ke database utk verify

  // setup nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "yourgmail@gmail.com",
      pass: "yourgmailpassword", // atau app password
    },
  });

  const mailOptions = {
    from: '"HawkGuard" <yourgmail@gmail.com>',
    to: email,
    subject: "Reset Your HawkGuard Password",
    html: `<p>Click the link to reset your password:</p>
           <a href="https://yourdomain.com/reset-password.html?token=${resetToken}">Reset Password</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
