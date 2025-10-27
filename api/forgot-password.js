import { supabaseServer } from "../lib/supabaseServer.js";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // 1️⃣ Semak user wujud
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError) return res.status(404).json({ error: "User not found" });

    // 2️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 3 * 60 * 1000).toISOString(); // 3 min expiry

    // 3️⃣ Simpan OTP ke Supabase
    const { error: otpError } = await supabaseServer
      .from("otp_store")
      .upsert([{ email, otp, expires_at }], { onConflict: ["email"] });

    if (otpError) throw otpError;

    // 4️⃣ Hantar OTP via email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"HawkGuard" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your HawkGuard OTP Code",
      text: `Your OTP code is: ${otp}. It expires in 3 minutes.`,
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);

    res.status(200).json({ ok: true, message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}
