// api/send-otp.js
import nodemailer from "nodemailer";
import { saveOtp } from "./otp_store.js";

const OTP_EXPIRY_SECONDS = Number(process.env.OTP_EXPIRY_SECONDS || 180);

function generate6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
  // Use Gmail SMTP (App Password recommended)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER / SMTP_PASS not configured");
  }
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });
}

export async function sendOtpAndStore(email) {
  const otp = generate6();
  const ttlMs = OTP_EXPIRY_SECONDS * 1000;
  saveOtp(email, otp, ttlMs);

  const transporter = createTransporter();
  const html = `
    <div style="font-family:Arial;padding:18px">
      <h3>HawkGuard Surveillance System — Verification Code</h3>
      <p>Your 6-digit verification code is:</p>
      <h1 style="letter-spacing:6px;color:#0b6cff">${otp}</h1>
      <p>This code expires in ${OTP_EXPIRY_SECONDS} seconds.</p>
      <p>If you did not request this, ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"HAWKGUARD SURVEILLANCE SYSTEM" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your HawkGuard 6-digit OTP",
    html
  });

  return { otp, expires_in: OTP_EXPIRY_SECONDS };
}

/**
 * Minimal handler if you want a direct /api/send-otp POST endpoint
 * Expect body: { email }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email" });
    await sendOtpAndStore(email);
    return res.json({ ok: true });
  } catch (err) {
    console.error("send-otp error", err);
    return res.status(500).json({ error: "Server error" });
  }
}
