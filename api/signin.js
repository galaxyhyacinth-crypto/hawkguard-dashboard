import { supabaseServer } from "../lib/supabaseServer.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const { data: users, error: fetchError } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", email)
      .limit(1);

    if (fetchError) throw fetchError;
    if (!users || users.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: otpError } = await supabaseServer
      .from("otp_store")
      .upsert([{ email, otp, expires_at }], { onConflict: "email" });

    if (otpError) throw otpError;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"HawkGuard" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your HawkGuard OTP Code",
      text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ otpRequired: true, message: "OTP sent" });
  } catch (err) {
    console.error("💥 Signin error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}
