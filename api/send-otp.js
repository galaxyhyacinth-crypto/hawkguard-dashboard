import nodemailer from "nodemailer";
import { saveOtp } from "./otp-store.js";

export function generateOtp6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(toEmail, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const html = `
    <div style="font-family:Arial;padding:20px">
      <h2>HawkGuard Verification Code</h2>
      <p>Your 6-digit OTP is:</p>
      <h1 style="letter-spacing:6px;color:#0b6cff">${otp}</h1>
      <p>This code will expire in ${process.env.OTP_EXPIRY_SECONDS || 180} seconds.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"HAWKGUARD SURVEILLANCE SYSTEM" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your HawkGuard 6-digit OTP",
    html
  });
}

export async function sendOtpAndStore(email, userId = null, fullName = "") {
  const otp = generateOtp6();
  const expirySeconds = Number(process.env.OTP_EXPIRY_SECONDS) || 180;
  saveOtp(email, otp, expirySeconds * 1000);
  await sendOtpEmail(email, otp);
}

// A minimal handler (not strictly necessary if signin.js calls sendOtpAndStore)
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email" });
    await sendOtpAndStore(email);
    res.json({ ok: true });
  } catch (err) {
    console.error("send-otp error", err);
    res.status(500).json({ error: "Server error" });
  }
}
